//! Ink bursts: the short splat a sticker throws when you press it.
//!
//! The queue is app-wide, like the toast queue. Call [`install_ink_bursts`]
//! once and put the returned host in the root of the page; sticker buttons
//! then burst on click without any wiring at the call site.

use std::time::Duration;

use gpui_kit::*;
use plopui_core::theme::Rgb;

use crate::paint;

/// How long one burst lives on screen.
pub const INK_BURST_MS: u64 = 460;
/// The square each burst is painted into, centered on the click.
const BURST_SIZE: f32 = 84.0;

#[derive(Clone, Debug)]
struct InkBurst {
    id: u64,
    position: Point<Pixels>,
    color: Rgb,
}

/// Recent bursts, newest last. One entry paints one splat and removes itself.
pub struct InkBurstQueue {
    bursts: Vec<InkBurst>,
    next_id: u64,
}

impl InkBurstQueue {
    pub fn new() -> Self {
        Self {
            bursts: Vec::new(),
            next_id: 0,
        }
    }

    pub fn len(&self) -> usize {
        self.bursts.len()
    }

    pub fn is_empty(&self) -> bool {
        self.bursts.is_empty()
    }

    /// Adds a burst at a window position. The entry removes itself after
    /// [`INK_BURST_MS`], so the queue cannot grow without a bound.
    pub fn burst(&mut self, position: Point<Pixels>, color: Rgb, cx: &mut Context<Self>) -> u64 {
        let id = self.next_id;
        self.next_id += 1;
        self.bursts.push(InkBurst {
            id,
            position,
            color,
        });
        cx.notify();
        cx.spawn(async move |this, cx| {
            cx.background_executor()
                .timer(Duration::from_millis(INK_BURST_MS + 60))
                .await;
            let _ = this.update(cx, |this, cx| {
                this.bursts.retain(|burst| burst.id != id);
                cx.notify();
            });
        })
        .detach();
        id
    }
}

impl Default for InkBurstQueue {
    fn default() -> Self {
        Self::new()
    }
}

struct InkGlobal(Entity<InkBurstQueue>);

impl Global for InkGlobal {}

/// Creates the app-wide burst queue, or returns the existing one.
pub fn init_ink_bursts(cx: &mut App) -> Entity<InkBurstQueue> {
    if let Some(existing) = cx.try_global::<InkGlobal>() {
        return existing.0.clone();
    }
    let queue = cx.new(|_| InkBurstQueue::new());
    cx.set_global(InkGlobal(queue.clone()));
    queue
}

/// The installed queue, when [`init_ink_bursts`] has run.
pub fn ink_burst_queue(cx: &App) -> Option<Entity<InkBurstQueue>> {
    cx.try_global::<InkGlobal>().map(|global| global.0.clone())
}

/// Throws one burst at a window position. A no-op when [`init_ink_bursts`] was
/// never called, so components stay usable in tests and in small demos.
pub fn ink_burst(cx: &mut App, position: Point<Pixels>, color: Rgb) {
    let queue = cx.try_global::<InkGlobal>().map(|global| global.0.clone());
    if let Some(queue) = queue {
        queue.update(cx, |queue, cx| {
            queue.burst(position, color, cx);
        });
    }
}

/// The overlay that paints the queue. Put it last in the root so bursts land
/// above the page but below toasts.
pub struct PlopInkBurstHost {
    queue: Entity<InkBurstQueue>,
}

impl PlopInkBurstHost {
    pub fn new(queue: Entity<InkBurstQueue>) -> Self {
        Self { queue }
    }
}

impl Render for PlopInkBurstHost {
    fn render(&mut self, _window: &mut Window, cx: &mut Context<Self>) -> impl IntoElement {
        let bursts = self.queue.read(cx).bursts.clone();
        div()
            .absolute()
            .inset_0()
            .children(bursts.into_iter().map(|burst| {
                let id = ElementId::Name(format!("ink-burst-{}", burst.id).into());
                let color = burst.color;
                let position = burst.position;
                div()
                    .absolute()
                    .left(position.x - px(BURST_SIZE * 0.5))
                    .top(position.y - px(BURST_SIZE * 0.5))
                    .size(px(BURST_SIZE))
                    .with_animation(
                        id,
                        Animation::new(Duration::from_millis(INK_BURST_MS)),
                        move |element, delta| {
                            element.child(
                                canvas(
                                    |bounds, _, _| bounds,
                                    move |bounds, _, window, _| {
                                        paint::paint_ink_burst(window, bounds, delta, color)
                                    },
                                )
                                .absolute()
                                .inset_0(),
                            )
                        },
                    )
            }))
    }
}

/// Installs the queue and builds the host in one call:
/// `let host = install_ink_bursts(cx);` then render `host` at the root.
pub fn install_ink_bursts(cx: &mut App) -> Entity<PlopInkBurstHost> {
    let queue = init_ink_bursts(cx);
    cx.new(|_| PlopInkBurstHost::new(queue))
}
