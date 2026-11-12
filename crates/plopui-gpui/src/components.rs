//! PlopUI components for GPUI.
//!
//! Interactive controls sit on `gpui-base` so keyboard, focus, IME and
//! accessibility behaviour is reused instead of reimplemented. Everything
//! visual is painted by the deterministic hand-drawn primitives in `paint`.

use std::rc::Rc;

use gpui_kit::base;
use gpui_kit::prelude::FluentBuilder as _;
use gpui_kit::*;
use plopui_core::theme::{
    self, BODY, Fill, MD, Rgb, SM, Status, SurfaceName, WEIGHT_BODY, WEIGHT_HEADING, WEIGHT_LETTER,
    XS,
};

use crate::color::{alpha_hsla, to_hsla};
use crate::icons::{IconKind, PlopIcon};
use crate::paint::{self, StickerSpec};
use crate::theme::PlopTheme;

type ClickHandler = Rc<dyn Fn(&ClickEvent, &mut Window, &mut App)>;
type SelectHandler = Rc<dyn Fn(usize, &mut Window, &mut App)>;
type ActionHandler = Rc<dyn Fn(&mut Window, &mut App)>;
type MenuItem = (SharedString, ActionHandler);
type ChangeHandler = Rc<dyn Fn(bool, &ClickEvent, &mut Window, &mut App)>;

pub const FONT: &str = "Sketchpop";

fn label(text: impl Into<SharedString>, size: f32, color: Rgb, weight: FontWeight) -> Div {
    div()
        .font_family(FONT)
        .text_size(px(size))
        .font_weight(weight)
        .italic()
        .text_color(to_hsla(color))
        .child(text.into())
}

fn body_text(text: impl Into<SharedString>, size: f32, color: Rgb) -> Div {
    div()
        .font_family(FONT)
        .text_size(px(size))
        .font_weight(FontWeight(WEIGHT_BODY as f32))
        .text_color(to_hsla(color))
        .child(text.into())
}

/// A die-cut sticker button.
#[derive(IntoElement)]
pub struct PlopButton {
    id: ElementId,
    label: SharedString,
    seed: SharedString,
    fill: Fill,
    theme: PlopTheme,
    focus: FocusHandle,
    disabled: bool,
    small: bool,
    icon_only: bool,
    flat: bool,
    icon: Option<IconKind>,
    loading: bool,
    loading_label: Option<SharedString>,
    on_click: Option<ClickHandler>,
}

impl PlopButton {
    pub fn new(
        id: impl Into<ElementId>,
        label: impl Into<SharedString>,
        theme: PlopTheme,
        focus: FocusHandle,
    ) -> Self {
        let label = label.into();
        Self {
            id: id.into(),
            seed: label.clone(),
            label,
            fill: Fill::Ink,
            theme,
            focus,
            disabled: false,
            small: false,
            icon_only: false,
            flat: false,
            icon: None,
            loading: false,
            loading_label: None,
            on_click: None,
        }
    }

    pub fn fill(mut self, fill: Fill) -> Self {
        self.fill = fill;
        self
    }

    pub fn disabled(mut self, disabled: bool) -> Self {
        self.disabled = disabled;
        self
    }

    pub fn small(mut self) -> Self {
        self.small = true;
        self
    }

    pub fn icon_only(mut self) -> Self {
        self.icon_only = true;
        self
    }

    pub fn flat(mut self) -> Self {
        self.flat = true;
        self
    }

    /// An icon drawn before the label, like React's `iconLeft`.
    pub fn icon(mut self, icon: IconKind) -> Self {
        self.icon = Some(icon);
        self
    }

    /// Shows the ink spinner, keeps the label's width, and ignores clicks.
    pub fn loading(mut self, loading: bool) -> Self {
        self.loading = loading;
        self
    }

    /// The accessible words while loading. Default "Loading".
    pub fn loading_label(mut self, label: impl Into<SharedString>) -> Self {
        self.loading_label = Some(label.into());
        self
    }

    pub fn on_click(
        mut self,
        handler: impl Fn(&ClickEvent, &mut Window, &mut App) + 'static,
    ) -> Self {
        self.on_click = Some(Rc::new(handler));
        self
    }
}

impl RenderOnce for PlopButton {
    fn render(self, window: &mut Window, _cx: &mut App) -> impl IntoElement {
        let focused = self.focus.is_focused(window);
        let spec = StickerSpec {
            seed: self.seed.clone(),
            fill: self.fill,
            focus_color: self.theme.mode().focus,
            focused,
            disabled: self.disabled,
            flat: self.flat,
        };
        let height = if self.small {
            px(44.0)
        } else if self.icon_only {
            px(56.0)
        } else {
            px(64.0)
        };
        let pad_x = if self.small { px(16.0) } else { px(30.0) };
        let font_size = if self.small {
            XS
        } else if self.icon_only {
            24.0
        } else {
            16.0
        };

        let label_color = self.fill.on_fill();
        let mut button = base::Button::new(self.id)
            .relative()
            .track_focus(&self.focus)
            .disabled(self.disabled)
            .h(height)
            .px(if self.icon_only { px(10.0) } else { pad_x })
            .flex()
            .items_center()
            .justify_center()
            .child(
                div().absolute().inset_0().child(
                    canvas(
                        move |bounds, _, _| bounds,
                        move |bounds, _, window, _| paint::paint_sticker(window, bounds, &spec),
                    )
                    .absolute()
                    .inset_0(),
                ),
            )
            .child({
                let loading = self.loading;
                // An icon-only button that has a real icon draws only the
                // icon; a bare "+" label is too thin to read as a sticker.
                let show_text = !(self.icon_only && self.icon.is_some());
                let text = div()
                    .font_family(FONT)
                    .text_size(px(font_size))
                    .font_weight(FontWeight(WEIGHT_LETTER as f32))
                    .italic()
                    .text_color(to_hsla(label_color))
                    .child(self.label.to_uppercase());
                let content = div()
                    .flex()
                    .items_center()
                    .gap(px(8.0))
                    .when_some(self.icon, |row, icon| {
                        row.child(
                            PlopIcon::new(icon, self.theme)
                                .size(if self.icon_only { 20.0 } else { 18.0 })
                                .color(label_color),
                        )
                    })
                    .when(show_text, |row| row.child(text))
                    .when(loading, |row| row.opacity(0.0));
                div()
                    .relative()
                    .flex()
                    .items_center()
                    .justify_center()
                    .child(content)
                    .when(loading, |stack| {
                        stack.child(
                            div()
                                .absolute()
                                .inset_0()
                                .flex()
                                .items_center()
                                .justify_center()
                                .child(
                                    PlopSpinner::new(ElementId::Name(
                                        format!("{}-spinner", self.seed).into(),
                                    ))
                                    .kind(SpinnerKind::Ink)
                                    .size(18.0)
                                    .color(label_color),
                                ),
                        )
                    })
            });

        if self.loading {
            let loading_label = self
                .loading_label
                .clone()
                .unwrap_or_else(|| "Loading".into());
            button = button.aria_label(format!("{} — {}", self.label, loading_label));
        } else {
            button = button.aria_label(self.label.clone());
        }
        if let Some(handler) = self.on_click {
            let loading = self.loading;
            let burst_color = self.theme.mode().on;
            button = button.on_click(move |event, window, cx| {
                if !loading {
                    crate::ink::ink_burst(cx, event.position(), burst_color);
                    handler(event, window, cx);
                }
            });
        }
        button
    }
}

/// A torn-paper tag. Display only; pair it with an IconButton if it needs an action.
#[derive(IntoElement)]
pub struct PlopTag {
    label: SharedString,
    fill: Fill,
    theme: PlopTheme,
    seed: SharedString,
}

impl PlopTag {
    pub fn new(label: impl Into<SharedString>, fill: Fill, theme: PlopTheme) -> Self {
        let label = label.into();
        Self {
            seed: label.clone(),
            label,
            fill,
            theme,
        }
    }
}

impl RenderOnce for PlopTag {
    fn render(self, _window: &mut Window, _cx: &mut App) -> impl IntoElement {
        let seed = self.seed.clone();
        let dark = self.theme.dark;
        let fill = self.fill;
        let text_color = fill.on_fill();
        div()
            .relative()
            .self_start()
            .h(px(38.0))
            .px(px(18.0))
            .flex()
            .items_center()
            .child(
                canvas(
                    move |bounds, _, _| bounds,
                    move |bounds, _, window, _| paint::paint_tag(window, bounds, &seed, fill, dark),
                )
                .absolute()
                .inset_0(),
            )
            .child(
                div()
                    .relative()
                    .font_family(FONT)
                    .text_size(px(XS))
                    .font_weight(FontWeight(WEIGHT_LETTER as f32))
                    .italic()
                    .text_color(to_hsla(text_color))
                    .child(self.label.to_uppercase()),
            )
    }
}

/// A paper card. Children are placed inside the ruled sheet.
#[derive(IntoElement)]
pub struct PlopCard {
    seed: SharedString,
    theme: PlopTheme,
    tape: bool,
    title: Option<SharedString>,
    children: Vec<AnyElement>,
}

impl PlopCard {
    pub fn new(seed: impl Into<SharedString>, theme: PlopTheme) -> Self {
        Self {
            seed: seed.into(),
            theme,
            tape: false,
            title: None,
            children: Vec::new(),
        }
    }

    pub fn tape(mut self) -> Self {
        self.tape = true;
        self
    }

    pub fn title(mut self, title: impl Into<SharedString>) -> Self {
        self.title = Some(title.into());
        self
    }
}

impl ParentElement for PlopCard {
    fn extend(&mut self, elements: impl IntoIterator<Item = AnyElement>) {
        self.children.extend(elements);
    }
}

impl RenderOnce for PlopCard {
    fn render(self, _window: &mut Window, _cx: &mut App) -> impl IntoElement {
        let seed = self.seed.clone();
        let mode = self.theme.mode();
        let tape = self.tape;
        let mut column = div()
            .relative()
            .p(px(32.0))
            .flex()
            .flex_col()
            .gap(px(12.0))
            // Paper scope: everything printed on the sheet reads in ink,
            // whatever surface the card itself sits on.
            .text_color(to_hsla(theme::color::INK_TEXT))
            .child(
                canvas(
                    move |bounds, _, _| bounds,
                    move |bounds, _, window, _| {
                        paint::paint_paper_card(window, bounds, &seed, mode, tape)
                    },
                )
                .absolute()
                .inset_0(),
            );
        if let Some(title) = self.title {
            column = column.child(
                div()
                    .font_family(FONT)
                    .text_size(px(22.0))
                    .font_weight(FontWeight(WEIGHT_HEADING as f32))
                    .italic()
                    .text_color(to_hsla(theme::color::INK))
                    .child(title),
            );
        }
        column.children(self.children)
    }
}

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum CalloutTone {
    Info,
    Warn,
    Error,
    Success,
}

impl CalloutTone {
    fn fill(self) -> Fill {
        match self {
            Self::Info => Fill::Periwinkle,
            Self::Warn => Fill::Mustard,
            Self::Error => Fill::Bubblegum,
            Self::Success => Fill::Mint,
        }
    }

    fn mark(self) -> &'static str {
        match self {
            Self::Info => "i",
            Self::Warn => "!",
            Self::Error => "x",
            Self::Success => "ok",
        }
    }

    fn title(self) -> &'static str {
        match self {
            Self::Info => "Note",
            Self::Warn => "Heads up",
            Self::Error => "Something broke",
            Self::Success => "All clear",
        }
    }
}

/// A sticky callout with a hand-drawn outline.
#[derive(IntoElement)]
pub struct PlopCallout {
    seed: SharedString,
    tone: CalloutTone,
    title: Option<SharedString>,
    body: SharedString,
}

impl PlopCallout {
    pub fn new(
        seed: impl Into<SharedString>,
        tone: CalloutTone,
        body: impl Into<SharedString>,
    ) -> Self {
        Self {
            seed: seed.into(),
            tone,
            title: None,
            body: body.into(),
        }
    }

    pub fn title(mut self, title: impl Into<SharedString>) -> Self {
        self.title = Some(title.into());
        self
    }
}

impl RenderOnce for PlopCallout {
    fn render(self, _window: &mut Window, _cx: &mut App) -> impl IntoElement {
        let fill = self.tone.fill();
        let text_color = fill.on_fill();
        let seed = self.seed.clone();
        let title = self.title.unwrap_or_else(|| self.tone.title().into());
        div()
            .relative()
            .w_full()
            .p(px(20.0))
            .flex()
            .items_start()
            .gap(px(14.0))
            .child(
                canvas(
                    move |bounds, _, _| bounds,
                    move |bounds, _, window, _| paint::paint_callout(window, bounds, &seed, fill),
                )
                .absolute()
                .inset_0(),
            )
            .child(
                div()
                    .relative()
                    .size(px(32.0))
                    .flex()
                    .items_center()
                    .justify_center()
                    .font_family(FONT)
                    .text_size(px(17.0))
                    .font_weight(FontWeight(WEIGHT_HEADING as f32))
                    .text_color(to_hsla(text_color))
                    .child(self.tone.mark()),
            )
            .child(
                div()
                    .relative()
                    .flex()
                    .flex_1()
                    .min_w_0()
                    .flex_col()
                    .gap(px(4.0))
                    .child(label(
                        title,
                        SM,
                        text_color,
                        FontWeight(WEIGHT_LETTER as f32),
                    ))
                    .child(body_text(self.body, 18.5, text_color).w_full()),
            )
    }
}

/// A hand-drawn progress bar.
#[derive(IntoElement)]
pub struct PlopProgress {
    label: Option<SharedString>,
    value_text: Option<SharedString>,
    ratio: f32,
    fill: Fill,
    theme: PlopTheme,
}

impl PlopProgress {
    pub fn new(ratio: f32, theme: PlopTheme) -> Self {
        Self {
            label: None,
            value_text: None,
            ratio,
            fill: Fill::Mint,
            theme,
        }
    }

    pub fn label(mut self, label: impl Into<SharedString>) -> Self {
        self.label = Some(label.into());
        self
    }

    pub fn value_text(mut self, value: impl Into<SharedString>) -> Self {
        self.value_text = Some(value.into());
        self
    }

    pub fn fill(mut self, fill: Fill) -> Self {
        self.fill = fill;
        self
    }
}

impl RenderOnce for PlopProgress {
    fn render(self, _window: &mut Window, _cx: &mut App) -> impl IntoElement {
        let ratio = self.ratio.clamp(0.0, 1.0);
        let fill = self.fill;
        let on = self.theme.mode().on_soft;
        let mut column = div().flex().flex_col().gap(px(10.0));
        if self.label.is_some() || self.value_text.is_some() {
            let mut header = div().flex().items_center().justify_between().gap(px(10.0));
            if let Some(label_text) = self.label {
                header = header.child(label(
                    label_text,
                    XS,
                    self.theme.mode().on,
                    FontWeight(WEIGHT_LETTER as f32),
                ));
            }
            if let Some(value) = self.value_text {
                header = header.child(
                    div()
                        .font_family(FONT)
                        .text_size(px(18.0))
                        .text_color(to_hsla(on))
                        .child(value),
                );
            }
            column = column.child(header);
        }
        column.child(
            div().relative().h(px(26.0)).w_full().child(
                canvas(
                    move |bounds, _, _| bounds,
                    move |bounds, _, window, _| paint::paint_progress(window, bounds, ratio, fill),
                )
                .absolute()
                .inset_0(),
            ),
        )
    }
}

/// A cut-paper skeleton block.
#[derive(IntoElement)]
pub struct PlopSkeleton {
    width: f32,
    height: f32,
    seed: SharedString,
    theme: PlopTheme,
}

impl PlopSkeleton {
    pub fn new(width: f32, height: f32, seed: impl Into<SharedString>, theme: PlopTheme) -> Self {
        Self {
            width,
            height,
            seed: seed.into(),
            theme,
        }
    }
}

impl RenderOnce for PlopSkeleton {
    fn render(self, _window: &mut Window, _cx: &mut App) -> impl IntoElement {
        let seed = self.seed;
        let color = self.theme.mode().on;
        div().relative().w(px(self.width)).h(px(self.height)).child(
            canvas(
                move |bounds, _, _| bounds,
                move |bounds, _, window, _| paint::paint_skeleton(window, bounds, &seed, color),
            )
            .absolute()
            .inset_0(),
        )
    }
}

/// Status dot plus a text label, never color alone.
#[derive(IntoElement)]
pub struct PlopStatus {
    status: Status,
    theme: PlopTheme,
}

impl PlopStatus {
    pub fn new(status: Status, theme: PlopTheme) -> Self {
        Self { status, theme }
    }
}

impl RenderOnce for PlopStatus {
    fn render(self, _window: &mut Window, _cx: &mut App) -> impl IntoElement {
        let status = self.status;
        let color = status.fill().color();
        let seed = format!("status-{}", status.label());
        div()
            .flex()
            .items_center()
            .gap(px(8.0))
            .child(
                div().relative().size(px(15.0)).child(
                    canvas(
                        move |bounds, _, _| bounds,
                        move |bounds, _, window, _| paint::paint_dot(window, bounds, color, &seed),
                    )
                    .absolute()
                    .inset_0(),
                ),
            )
            .child(body_text(status.label(), MD, self.theme.mode().on))
    }
}

/// A blob avatar with initials.
#[derive(IntoElement)]
pub struct PlopAvatar {
    name: SharedString,
    size: f32,
    fill: Option<Fill>,
    status: Option<AvatarStatus>,
    status_label: Option<SharedString>,
    initials: bool,
}

/// The dot on an avatar's shoulder. The words go into the accessible name.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum AvatarStatus {
    Online,
    Busy,
    Offline,
}

impl AvatarStatus {
    pub const ALL: [AvatarStatus; 3] = [Self::Online, Self::Busy, Self::Offline];

    pub fn label(self) -> &'static str {
        match self {
            Self::Online => "online",
            Self::Busy => "busy",
            Self::Offline => "offline",
        }
    }

    fn color(self) -> Rgb {
        match self {
            Self::Online => theme::color::LEAF,
            Self::Busy => theme::color::MUSTARD,
            Self::Offline => theme::color::INK_SOFT,
        }
    }
}

fn generated_avatar_fill(name: &str) -> Fill {
    let mut rng = plopui_core::seed::seed(name);
    let palette = [
        Fill::Bubblegum,
        Fill::Mustard,
        Fill::Tomato,
        Fill::Mint,
        Fill::Periwinkle,
    ];
    palette[(rng.next_f64() * palette.len() as f64) as usize % palette.len()]
}

impl PlopAvatar {
    /// A generated doodle face for `name`; the same name always gets the same face.
    pub fn new(name: impl Into<SharedString>) -> Self {
        Self {
            name: name.into(),
            size: 52.0,
            fill: None,
            status: None,
            status_label: None,
            initials: false,
        }
    }

    pub fn size(mut self, size: f32) -> Self {
        self.size = size;
        self
    }

    /// Override the paper color behind the face.
    pub fn fill(mut self, fill: Fill) -> Self {
        self.fill = Some(fill);
        self
    }

    pub fn status(mut self, status: AvatarStatus) -> Self {
        self.status = Some(status);
        self
    }

    /// Words for the status, e.g. "on a call". Defaults to online / busy / offline.
    pub fn status_label(mut self, label: impl Into<SharedString>) -> Self {
        self.status_label = Some(label.into());
        self
    }

    /// Use initials instead of a generated face, for team or unit marks.
    pub fn initials(mut self) -> Self {
        self.initials = true;
        self
    }
}

impl RenderOnce for PlopAvatar {
    fn render(self, _window: &mut Window, _cx: &mut App) -> impl IntoElement {
        let name = self.name;
        let size = self.size;
        let fill = self.fill.unwrap_or_else(|| generated_avatar_fill(&name));
        let text_color = fill.on_fill();
        let status = self.status;
        let label = match status {
            Some(status) => format!(
                "{name}, {}",
                self.status_label
                    .as_deref()
                    .unwrap_or_else(|| status.label())
            ),
            None => name.to_string(),
        };
        let initials = self.initials;
        let seed = name.clone();
        let id = ElementId::Name(format!("avatar-{name}-{}", size as i32).into());
        div()
            .id(id)
            .role(Role::Image)
            .aria_label(label)
            .relative()
            .size(px(size))
            .flex()
            .items_center()
            .justify_center()
            .child(
                canvas(
                    move |bounds, _, _| bounds,
                    move |bounds, _, window, _| {
                        if initials {
                            paint::paint_avatar(window, bounds, fill, &seed);
                        } else {
                            paint::paint_face(
                                window,
                                bounds,
                                &seed,
                                fill,
                                status.map(AvatarStatus::color),
                            );
                        }
                    },
                )
                .absolute()
                .inset_0(),
            )
            .when(initials, |avatar| {
                avatar.child(
                    div()
                        .relative()
                        .font_family(FONT)
                        .text_size(px(size * 0.34))
                        .font_weight(FontWeight(WEIGHT_HEADING as f32))
                        .italic()
                        .text_color(to_hsla(text_color))
                        .child(name.chars().take(2).collect::<String>().to_uppercase()),
                )
            })
    }
}

/// Display heading with the underline scribble.
#[derive(IntoElement)]
pub struct PlopHeading {
    text: SharedString,
    size: f32,
    level: u8,
    theme: PlopTheme,
}

impl PlopHeading {
    pub fn new(text: impl Into<SharedString>, level: u8, theme: PlopTheme) -> Self {
        let size = match level {
            1 => 56.0,
            2 => 34.0,
            3 => 22.0,
            _ => 17.0,
        };
        Self {
            text: text.into(),
            size,
            level,
            theme,
        }
    }
}

impl RenderOnce for PlopHeading {
    fn render(self, _window: &mut Window, _cx: &mut App) -> impl IntoElement {
        let underline_color = if self.theme.surface == SurfaceName::Riso {
            theme::color::MUSTARD
        } else {
            theme::color::TOMATO
        };
        let line_width = if self.level <= 2 { 200.0 } else { 110.0 };
        div()
            .flex()
            .flex_col()
            .gap(px(4.0))
            .child(
                div()
                    .font_family(FONT)
                    .text_size(px(self.size))
                    .font_weight(FontWeight(WEIGHT_HEADING as f32))
                    .italic()
                    .text_color(to_hsla(self.theme.mode().on))
                    .child(self.text.to_uppercase()),
            )
            .child(
                div().relative().w(px(line_width)).h(px(10.0)).child(
                    canvas(
                        move |bounds, _, _| bounds,
                        move |bounds, _, window, _| {
                            paint::paint_underline(window, bounds, underline_color)
                        },
                    )
                    .absolute()
                    .inset_0(),
                ),
            )
    }
}

/// A dashed rule between sections.
#[derive(IntoElement)]
pub struct PlopDivider {
    theme: PlopTheme,
}

impl PlopDivider {
    pub fn new(theme: PlopTheme) -> Self {
        Self { theme }
    }
}

impl RenderOnce for PlopDivider {
    fn render(self, _window: &mut Window, _cx: &mut App) -> impl IntoElement {
        let color = self.theme.mode().on_soft;
        div().relative().h(px(12.0)).w_full().child(
            canvas(
                move |bounds, _, _| bounds,
                move |bounds, _, window, _| paint::paint_divider(window, bounds, color),
            )
            .absolute()
            .inset_0(),
        )
    }
}

/// Controlled checkbox built on the base interaction layer.
#[derive(IntoElement)]
pub struct PlopCheckbox {
    id: ElementId,
    seed: SharedString,
    label: SharedString,
    checked: bool,
    disabled: bool,
    theme: PlopTheme,
    focus: FocusHandle,
    on_change: Option<ChangeHandler>,
}

impl PlopCheckbox {
    pub fn new(
        id: impl Into<ElementId>,
        label: impl Into<SharedString>,
        checked: bool,
        theme: PlopTheme,
        focus: FocusHandle,
    ) -> Self {
        let label = label.into();
        Self {
            id: id.into(),
            seed: label.clone(),
            label,
            checked,
            disabled: false,
            theme,
            focus,
            on_change: None,
        }
    }

    pub fn disabled(mut self, disabled: bool) -> Self {
        self.disabled = disabled;
        self
    }

    pub fn on_change(
        mut self,
        handler: impl Fn(bool, &ClickEvent, &mut Window, &mut App) + 'static,
    ) -> Self {
        self.on_change = Some(Rc::new(handler));
        self
    }
}

impl RenderOnce for PlopCheckbox {
    fn render(self, window: &mut Window, _cx: &mut App) -> impl IntoElement {
        let focused = self.focus.is_focused(window);
        let seed = self.seed.clone();
        let checked = self.checked;
        let focus_color = self.theme.mode().focus;
        let text_color = if self.disabled {
            theme::color::INK_SOFT
        } else {
            theme::color::INK_TEXT
        };
        let mut row = base::Checkbox::new(self.id)
            .checked(checked)
            .disabled(self.disabled)
            .track_focus(&self.focus)
            .flex()
            .items_center()
            .gap(px(12.0))
            .child(
                div().relative().size(px(30.0)).child(
                    canvas(
                        move |bounds, _, _| bounds,
                        move |bounds, _, window, _| {
                            paint::paint_checkbox(
                                window,
                                bounds,
                                checked,
                                focus_color,
                                focused,
                                &seed,
                            )
                        },
                    )
                    .absolute()
                    .inset_0(),
                ),
            )
            .child(body_text(self.label, BODY, text_color));
        if let Some(handler) = self.on_change {
            row = row.on_change(move |next, event, window, cx| {
                handler(next == base::CheckboxState::Checked, event, window, cx)
            });
        }
        row
    }
}

/// Controlled switch with a hand-drawn track.
#[derive(IntoElement)]
pub struct PlopSwitch {
    id: ElementId,
    seed: SharedString,
    label: SharedString,
    checked: bool,
    disabled: bool,
    theme: PlopTheme,
    focus: FocusHandle,
    on_change: Option<ChangeHandler>,
}

impl PlopSwitch {
    pub fn new(
        id: impl Into<ElementId>,
        label: impl Into<SharedString>,
        checked: bool,
        theme: PlopTheme,
        focus: FocusHandle,
    ) -> Self {
        let label = label.into();
        Self {
            id: id.into(),
            seed: label.clone(),
            label,
            checked,
            disabled: false,
            theme,
            focus,
            on_change: None,
        }
    }

    pub fn disabled(mut self, disabled: bool) -> Self {
        self.disabled = disabled;
        self
    }

    pub fn on_change(
        mut self,
        handler: impl Fn(bool, &ClickEvent, &mut Window, &mut App) + 'static,
    ) -> Self {
        self.on_change = Some(Rc::new(handler));
        self
    }
}

impl RenderOnce for PlopSwitch {
    fn render(self, window: &mut Window, _cx: &mut App) -> impl IntoElement {
        let focused = self.focus.is_focused(window);
        let seed = self.seed.clone();
        let checked = self.checked;
        let focus_color = self.theme.mode().focus;
        let text_color = if self.disabled {
            theme::color::INK_SOFT
        } else {
            theme::color::INK_TEXT
        };
        let mut row = base::Switch::new(self.id)
            .checked(checked)
            .disabled(self.disabled)
            .track_focus(&self.focus)
            .flex()
            .items_center()
            .gap(px(14.0))
            .child(
                div().relative().w(px(78.0)).h(px(48.0)).child(
                    canvas(
                        move |bounds, _, _| bounds,
                        move |bounds, _, window, _| {
                            paint::paint_switch(
                                window,
                                bounds,
                                checked,
                                focus_color,
                                focused,
                                &seed,
                            )
                        },
                    )
                    .absolute()
                    .inset_0(),
                ),
            )
            .child(body_text(self.label, BODY, text_color));
        if let Some(handler) = self.on_change {
            row = row.on_change(move |next, event, window, cx| handler(next, event, window, cx));
        }
        row
    }
}

/// One radio in a group.
#[derive(IntoElement)]
pub struct PlopRadio {
    id: ElementId,
    seed: SharedString,
    label: SharedString,
    checked: bool,
    disabled: bool,
    theme: PlopTheme,
    focus: FocusHandle,
    tab_stop: bool,
    position_in_set: Option<(usize, usize)>,
    on_change: Option<ChangeHandler>,
}

impl PlopRadio {
    pub fn new(
        id: impl Into<ElementId>,
        label: impl Into<SharedString>,
        checked: bool,
        theme: PlopTheme,
        focus: FocusHandle,
    ) -> Self {
        let label = label.into();
        Self {
            id: id.into(),
            seed: label.clone(),
            label,
            checked,
            disabled: false,
            theme,
            focus,
            tab_stop: true,
            position_in_set: None,
            on_change: None,
        }
    }

    pub fn disabled(mut self, disabled: bool) -> Self {
        self.disabled = disabled;
        self
    }

    /// Allows a group to keep one roving tab stop instead of one per radio.
    pub fn tab_stop(mut self, tab_stop: bool) -> Self {
        self.tab_stop = tab_stop;
        self
    }

    /// Announces "option N of M" to assistive technology.
    pub fn position_in_set(mut self, position: usize, size: usize) -> Self {
        self.position_in_set = Some((position, size));
        self
    }

    pub fn on_change(
        mut self,
        handler: impl Fn(bool, &ClickEvent, &mut Window, &mut App) + 'static,
    ) -> Self {
        self.on_change = Some(Rc::new(handler));
        self
    }
}

impl RenderOnce for PlopRadio {
    fn render(self, window: &mut Window, _cx: &mut App) -> impl IntoElement {
        let focused = self.focus.is_focused(window);
        let seed = self.seed.clone();
        let checked = self.checked;
        let focus_color = self.theme.mode().focus;
        let text_color = if self.disabled {
            theme::color::INK_SOFT
        } else {
            theme::color::INK_TEXT
        };
        let mut row = base::Radio::new(self.id)
            .checked(checked)
            .disabled(self.disabled)
            .track_focus(&self.focus)
            .tab_stop(self.tab_stop)
            .flex()
            .items_center()
            .gap(px(12.0))
            .child(
                div().relative().size(px(30.0)).child(
                    canvas(
                        move |bounds, _, _| bounds,
                        move |bounds, _, window, _| {
                            paint::paint_radio(window, bounds, checked, focus_color, focused, &seed)
                        },
                    )
                    .absolute()
                    .inset_0(),
                ),
            )
            .child(body_text(self.label, BODY, text_color));
        if let Some((position, size)) = self.position_in_set {
            row = row.set_position(position, size);
        }
        if let Some(handler) = self.on_change {
            row = row.on_change(move |next, event, window, cx| handler(next, event, window, cx));
        }
        row
    }
}

/// A radio group with a legend, one roving tab stop and arrow-key selection.
/// The app owns the selected index, the focus handles and the state change.
#[derive(IntoElement)]
pub struct PlopRadioGroup {
    id: SharedString,
    legend: SharedString,
    options: Vec<SharedString>,
    selected: usize,
    focuses: Vec<FocusHandle>,
    theme: PlopTheme,
    vertical: bool,
    disabled: bool,
    on_change: Option<SelectHandler>,
}

impl PlopRadioGroup {
    pub fn new(
        id: impl Into<SharedString>,
        legend: impl Into<SharedString>,
        options: Vec<SharedString>,
        selected: usize,
        focuses: Vec<FocusHandle>,
        theme: PlopTheme,
    ) -> Self {
        Self {
            id: id.into(),
            legend: legend.into(),
            options,
            selected,
            focuses,
            theme,
            vertical: true,
            disabled: false,
            on_change: None,
        }
    }

    /// Horizontal groups read left/right as well as up/down.
    pub fn vertical(mut self, vertical: bool) -> Self {
        self.vertical = vertical;
        self
    }

    pub fn disabled(mut self, disabled: bool) -> Self {
        self.disabled = disabled;
        self
    }

    pub fn on_change(mut self, handler: impl Fn(usize, &mut Window, &mut App) + 'static) -> Self {
        self.on_change = Some(Rc::new(handler));
        self
    }
}

impl RenderOnce for PlopRadioGroup {
    fn render(self, _window: &mut Window, cx: &mut App) -> impl IntoElement {
        let count = self.options.len();
        let selected = if count == 0 {
            0
        } else {
            self.selected.min(count - 1)
        };
        let focuses = self.focuses.clone();
        let on_change = self.on_change.clone();
        let disabled = self.disabled;
        let theme = self.theme;

        let mut group = base::RadioGroup::new(ElementId::Name(format!("{}-group", self.id).into()))
            .aria_label(self.legend.clone())
            .flex()
            .gap(px(10.0));
        group = if self.vertical {
            group.flex_col().axis(Axis::Vertical)
        } else {
            group.flex_row().items_center().axis(Axis::Horizontal)
        };
        group = group.on_key_down({
            let focuses = focuses.clone();
            let on_change = on_change.clone();
            move |event, window, cx| {
                if disabled || focuses.is_empty() {
                    return;
                }
                let count = focuses.len();
                let current = focuses
                    .iter()
                    .position(|handle| handle.is_focused(window))
                    .unwrap_or(selected);
                let target = match event.keystroke.key.as_str() {
                    "left" | "up" => Some((current + count - 1) % count),
                    "right" | "down" => Some((current + 1) % count),
                    "home" => Some(0),
                    "end" => Some(count - 1),
                    _ => None,
                };
                let Some(target) = target else {
                    return;
                };
                if let Some(handle) = focuses.get(target) {
                    window.focus(handle, cx);
                }
                if let Some(handler) = on_change.clone() {
                    handler(target, window, cx);
                }
                cx.stop_propagation();
            }
        });

        let mut radios = Vec::with_capacity(count);
        for (index, option) in self.options.into_iter().enumerate() {
            let focus = focuses
                .get(index)
                .cloned()
                .unwrap_or_else(|| cx.focus_handle());
            let handler = on_change.clone();
            let mut radio = PlopRadio::new(
                ElementId::Name(format!("{}-{index}", self.id).into()),
                option,
                index == selected,
                theme,
                focus,
            )
            .disabled(disabled)
            .tab_stop(index == selected)
            .position_in_set(index + 1, count);
            if let Some(handler) = handler {
                radio = radio.on_change(move |_, _, window, cx| handler(index, window, cx));
            }
            radios.push(radio.into_any_element());
        }

        div()
            .flex()
            .flex_col()
            .gap(px(10.0))
            .child(meta_text(self.legend, theme::color::INK_SOFT))
            .child(group.children(radios))
    }
}

/// A labelled text field wrapping the base single-line editor (IME, selection,
/// clipboard and undo stay in the foundation).
#[derive(IntoElement)]
pub struct PlopTextField {
    state: Entity<base::input::InputState>,
    seed: SharedString,
    label: SharedString,
    hint: Option<SharedString>,
    error: Option<SharedString>,
    theme: PlopTheme,
}

impl PlopTextField {
    pub fn new(
        state: Entity<base::input::InputState>,
        label: impl Into<SharedString>,
        theme: PlopTheme,
    ) -> Self {
        let label = label.into();
        Self {
            state,
            seed: label.clone(),
            label,
            hint: None,
            error: None,
            theme,
        }
    }

    pub fn hint(mut self, hint: impl Into<SharedString>) -> Self {
        self.hint = Some(hint.into());
        self
    }

    pub fn error(mut self, error: impl Into<SharedString>) -> Self {
        self.error = Some(error.into());
        self
    }
}

impl RenderOnce for PlopTextField {
    fn render(self, window: &mut Window, cx: &mut App) -> impl IntoElement {
        let focus = self.state.read(cx).focus_handle(cx);
        let focused = focus.is_focused(window);
        let seed = self.seed.clone();
        let focus_color = self.theme.mode().focus;
        let error = self.error.is_some();
        // The field paints its own cream sheet, so its label and hint are ink
        // even when the page around it is a dark surface.
        let on = theme::color::INK;
        let on_soft = theme::color::INK_SOFT;
        let mut column = div()
            .flex()
            .flex_col()
            .gap(px(8.0))
            .child(label(self.label, SM, on, FontWeight(WEIGHT_LETTER as f32)))
            .child(
                div()
                    .relative()
                    .h(px(58.0))
                    .w_full()
                    .child(
                        canvas(
                            move |bounds, _, _| bounds,
                            move |bounds, _, window, _| {
                                paint::paint_field(
                                    window,
                                    bounds,
                                    &seed,
                                    focus_color,
                                    focused,
                                    error,
                                )
                            },
                        )
                        .absolute()
                        .inset_0(),
                    )
                    .child(
                        div()
                            .absolute()
                            .inset_0()
                            .px(px(18.0))
                            .flex()
                            .items_center()
                            .font_family(FONT)
                            .text_size(px(20.0))
                            .text_color(to_hsla(theme::color::INK_TEXT))
                            .child(base::Input::new(&self.state)),
                    ),
            );
        if let Some(error) = self.error {
            column = column.child(body_text(error, 16.5, theme::color::TOMATO_TEXT));
        } else if let Some(hint) = self.hint {
            column = column.child(body_text(hint, 16.5, on_soft));
        }
        column
    }
}

/// A compact toast card.
#[derive(IntoElement)]
pub struct PlopToast {
    message: SharedString,
    tone: CalloutTone,
}

impl PlopToast {
    pub fn new(message: impl Into<SharedString>, tone: CalloutTone) -> Self {
        Self {
            message: message.into(),
            tone,
        }
    }
}

impl RenderOnce for PlopToast {
    fn render(self, _window: &mut Window, _cx: &mut App) -> impl IntoElement {
        let fill = self.tone.fill();
        let text_color = fill.on_fill();
        div()
            .relative()
            .flex()
            .items_center()
            .gap(px(10.0))
            .px(px(18.0))
            .py(px(10.0))
            .child(
                canvas(
                    move |bounds, _, _| bounds,
                    move |bounds, _, window, _| paint::paint_callout(window, bounds, "toast", fill),
                )
                .absolute()
                .inset_0(),
            )
            .child(
                div()
                    .relative()
                    .font_family(FONT)
                    .text_size(px(SM))
                    .font_weight(FontWeight(WEIGHT_LETTER as f32))
                    .italic()
                    .text_color(to_hsla(text_color))
                    .child(self.message.to_uppercase()),
            )
    }
}

/// The six moods of the buddy cast. Each one stands for exactly one state,
/// matching the React kit: success, error, stale, congrats, preview, thinking.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum BuddyMood {
    Success,
    Error,
    Stale,
    Congrats,
    Preview,
    Thinking,
}

impl BuddyMood {
    pub const ALL: [BuddyMood; 6] = [
        BuddyMood::Success,
        BuddyMood::Error,
        BuddyMood::Stale,
        BuddyMood::Congrats,
        BuddyMood::Preview,
        BuddyMood::Thinking,
    ];

    pub fn label(self) -> &'static str {
        match self {
            Self::Success => "success",
            Self::Error => "error",
            Self::Stale => "stale",
            Self::Congrats => "congrats",
            Self::Preview => "preview",
            Self::Thinking => "thinking",
        }
    }

    pub(crate) fn fill(self) -> Fill {
        match self {
            Self::Success => Fill::Mint,
            Self::Error => Fill::Bubblegum,
            Self::Stale => Fill::Periwinkle,
            Self::Congrats => Fill::Mustard,
            Self::Preview => Fill::Plain,
            Self::Thinking => Fill::Periwinkle,
        }
    }
}

/// A buddy face. The mood is drawn, not written, but it is also exposed to
/// accessibility clients so the face is never decoration-only.
#[derive(IntoElement)]
pub struct PlopBuddy {
    mood: BuddyMood,
    size: f32,
    seed: SharedString,
}

impl PlopBuddy {
    pub fn new(mood: BuddyMood) -> Self {
        Self {
            mood,
            size: 84.0,
            seed: format!("buddy-{}", mood.label()).into(),
        }
    }

    pub fn size(mut self, size: f32) -> Self {
        self.size = size;
        self
    }

    pub fn seed(mut self, seed: impl Into<SharedString>) -> Self {
        self.seed = seed.into();
        self
    }
}

impl RenderOnce for PlopBuddy {
    fn render(self, _window: &mut Window, _cx: &mut App) -> impl IntoElement {
        let mood = self.mood;
        let seed = self.seed;
        let size = self.size;
        div()
            .id(ElementId::Name(format!("{seed}-face").into()))
            .role(Role::Image)
            .aria_label(format!("{} buddy", mood.label()))
            .relative()
            .size(px(size))
            .child(
                canvas(
                    move |bounds, _, _| bounds,
                    move |bounds, _, window, _| paint::paint_buddy(window, bounds, mood, &seed),
                )
                .absolute()
                .inset_0(),
            )
    }
}

/// A small helper for gallery headers.
pub fn meta_text(text: impl Into<SharedString>, color: Rgb) -> Div {
    div()
        .font_family(FONT)
        .text_size(px(XS))
        .font_weight(FontWeight(WEIGHT_LETTER as f32))
        .italic()
        .text_color(to_hsla(color))
        .child(text.into())
}

/// A hand-drawn loading arc. Rotation is the only motion; reduced-motion
/// hosts get the arc at rest, because `gpui_pre`'s animation element already
/// pins reduced-motion animations to their end frame.
#[derive(IntoElement)]
pub struct PlopSpinner {
    id: ElementId,
    kind: SpinnerKind,
    size: f32,
    color: Rgb,
    seed: SharedString,
    label: SharedString,
}

/// The five waiting marks from the React kit.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum SpinnerKind {
    Ink,
    Dots,
    Scribble,
    Sticker,
    Buddy,
}

impl SpinnerKind {
    pub const ALL: [SpinnerKind; 5] = [
        Self::Ink,
        Self::Dots,
        Self::Scribble,
        Self::Sticker,
        Self::Buddy,
    ];

    pub fn label(self) -> &'static str {
        match self {
            Self::Ink => "ink",
            Self::Dots => "dots",
            Self::Scribble => "scribble",
            Self::Sticker => "sticker",
            Self::Buddy => "buddy",
        }
    }
}

impl PlopSpinner {
    pub fn new(id: impl Into<ElementId>) -> Self {
        Self {
            id: id.into(),
            kind: SpinnerKind::Ink,
            size: 34.0,
            color: theme::color::INK,
            seed: "spinner".into(),
            label: "Loading".into(),
        }
    }

    pub fn kind(mut self, kind: SpinnerKind) -> Self {
        self.kind = kind;
        self
    }

    pub fn size(mut self, size: f32) -> Self {
        self.size = size;
        self
    }

    pub fn color(mut self, color: Rgb) -> Self {
        self.color = color;
        self
    }

    pub fn seed(mut self, seed: impl Into<SharedString>) -> Self {
        self.seed = seed.into();
        self
    }

    pub fn label(mut self, label: impl Into<SharedString>) -> Self {
        self.label = label.into();
        self
    }
}

impl Default for PlopSpinner {
    fn default() -> Self {
        Self::new("plop-spinner")
    }
}

impl RenderOnce for PlopSpinner {
    fn render(self, _window: &mut Window, _cx: &mut App) -> impl IntoElement {
        let size = self.size;
        let kind = self.kind;
        let color = self.color;
        let seed = self.seed;
        div()
            .id(self.id.clone())
            .relative()
            .size(px(size))
            .role(Role::ProgressIndicator)
            .aria_label(self.label)
            .with_animation(
                self.id,
                Animation::new(std::time::Duration::from_millis(1100)).repeat(),
                move |element, delta| {
                    let seed = seed.clone();
                    element.child(
                        canvas(
                            move |bounds, _, _| bounds,
                            move |bounds, _, window, _| {
                                paint::paint_spinner_kind(
                                    window,
                                    bounds,
                                    kind,
                                    color,
                                    &seed,
                                    delta * 360.0,
                                )
                            },
                        )
                        .absolute()
                        .inset_0(),
                    )
                },
            )
    }
}

/// A round counter badge, useful for inboxes and unread chips.
#[derive(IntoElement)]
pub struct PlopCount {
    count: u32,
    fill: Fill,
    size: f32,
    seed: SharedString,
}

impl PlopCount {
    pub fn new(count: u32) -> Self {
        Self {
            count,
            fill: Fill::Mustard,
            size: 34.0,
            seed: "count".into(),
        }
    }

    pub fn fill(mut self, fill: Fill) -> Self {
        self.fill = fill;
        self
    }

    pub fn size(mut self, size: f32) -> Self {
        self.size = size;
        self
    }

    pub fn seed(mut self, seed: impl Into<SharedString>) -> Self {
        self.seed = seed.into();
        self
    }
}

impl RenderOnce for PlopCount {
    fn render(self, _window: &mut Window, _cx: &mut App) -> impl IntoElement {
        let fill = self.fill;
        let color = fill.color();
        let text_color = fill.on_fill();
        let size = self.size;
        let label = if self.count > 99 {
            "99+".to_string()
        } else {
            self.count.to_string()
        };
        let seed = self.seed;
        let id = ElementId::Name(format!("count-{}-{seed}", self.count).into());
        div()
            .id(id)
            .role(Role::Status)
            .aria_label(format!("{} unread", self.count))
            .relative()
            .min_w(px(size))
            .h(px(size))
            .px(px(6.0))
            .flex()
            .items_center()
            .justify_center()
            .child(
                canvas(
                    move |bounds, _, _| bounds,
                    move |bounds, _, window, _| paint::paint_dot(window, bounds, color, &seed),
                )
                .absolute()
                .inset_0(),
            )
            .child(
                div()
                    .relative()
                    .font_family(FONT)
                    .text_size(px(if self.count > 99 {
                        size * 0.32
                    } else {
                        size * 0.4
                    }))
                    .font_weight(FontWeight(WEIGHT_HEADING as f32))
                    .italic()
                    .text_color(to_hsla(text_color))
                    .child(label),
            )
    }
}

/// Overlapping avatars with a "+N" chip when the list is longer than `max`.
#[derive(IntoElement)]
pub struct PlopAvatarStack {
    people: Vec<(SharedString, Fill)>,
    max: usize,
    size: f32,
}

impl PlopAvatarStack {
    pub fn new() -> Self {
        Self {
            people: Vec::new(),
            max: 4,
            size: 44.0,
        }
    }

    pub fn person(mut self, initials: impl Into<SharedString>, fill: Fill) -> Self {
        self.people.push((initials.into(), fill));
        self
    }

    pub fn max(mut self, max: usize) -> Self {
        self.max = max.max(1);
        self
    }

    pub fn size(mut self, size: f32) -> Self {
        self.size = size;
        self
    }
}

impl Default for PlopAvatarStack {
    fn default() -> Self {
        Self::new()
    }
}

impl RenderOnce for PlopAvatarStack {
    fn render(self, _window: &mut Window, _cx: &mut App) -> impl IntoElement {
        let size = self.size;
        let shown = self.people.len().min(self.max);
        let extra = self.people.len().saturating_sub(shown);
        let mut row = div().flex().items_center();
        for (index, (initials, fill)) in self.people.into_iter().take(shown).enumerate() {
            let avatar = PlopAvatar::new(initials)
                .size(size)
                .fill(fill)
                .into_any_element();
            row = row.child(if index == 0 {
                avatar
            } else {
                div().ml(px(-size * 0.28)).child(avatar).into_any_element()
            });
        }
        if extra > 0 {
            row = row.child(
                div()
                    .ml(px(-size * 0.28))
                    .child(PlopCount::new(extra as u32).size(size).seed("avatar-extra")),
            );
        }
        row
    }
}

/// A friendly blank slate: doodle first, then one sentence and one action.
#[derive(IntoElement)]
pub struct PlopEmptyState {
    title: SharedString,
    body: Option<SharedString>,
    action: Option<AnyElement>,
    theme: PlopTheme,
}

impl PlopEmptyState {
    pub fn new(title: impl Into<SharedString>, theme: PlopTheme) -> Self {
        Self {
            title: title.into(),
            body: None,
            action: None,
            theme,
        }
    }

    pub fn body(mut self, body: impl Into<SharedString>) -> Self {
        self.body = Some(body.into());
        self
    }

    pub fn action(mut self, action: impl IntoElement) -> Self {
        self.action = Some(action.into_any_element());
        self
    }
}

impl RenderOnce for PlopEmptyState {
    fn render(self, _window: &mut Window, _cx: &mut App) -> impl IntoElement {
        let color = self.theme.mode().on;
        let soft = self.theme.mode().on_soft;
        let mut column = div()
            .w_full()
            .flex()
            .flex_col()
            .items_center()
            .gap(px(14.0))
            .py(px(24.0))
            .child(
                div().relative().size(px(104.0)).child(
                    canvas(
                        move |bounds, _, _| bounds,
                        move |bounds, _, window, _| {
                            paint::paint_empty_doodle(window, bounds, color)
                        },
                    )
                    .absolute()
                    .inset_0(),
                ),
            )
            .child(label(
                self.title,
                26.0,
                color,
                FontWeight(WEIGHT_HEADING as f32),
            ));
        if let Some(body) = self.body {
            column = column.child(
                div()
                    .max_w(px(360.0))
                    .text_center()
                    .child(body_text(body, BODY, soft)),
            );
        }
        if let Some(action) = self.action {
            column = column.child(action);
        }
        column
    }
}

/// A horizontal status rail. Completed steps are ink, upcoming steps are
/// outlined; the label under each dot carries the meaning, not the color.
#[derive(IntoElement)]
pub struct PlopStatusTimeline {
    steps: Vec<SharedString>,
    current: usize,
    theme: PlopTheme,
}

impl PlopStatusTimeline {
    pub fn new<I, S>(steps: I, current: usize, theme: PlopTheme) -> Self
    where
        I: IntoIterator<Item = S>,
        S: Into<SharedString>,
    {
        Self {
            steps: steps.into_iter().map(Into::into).collect(),
            current,
            theme,
        }
    }
}

impl RenderOnce for PlopStatusTimeline {
    fn render(self, _window: &mut Window, _cx: &mut App) -> impl IntoElement {
        let steps = self.steps;
        let count = steps.len();
        if count == 0 {
            return div();
        }
        let current = self.current.min(count - 1);
        let mode = self.theme.mode();
        let done = theme::color::INK;
        let pending = theme::color::INK_SOFT;
        let mut labels = div().flex().w_full();
        for (index, step) in steps.iter().enumerate() {
            let color = if index <= current {
                mode.on
            } else {
                mode.on_soft
            };
            labels = labels.child(div().flex_1().flex().justify_center().child(body_text(
                step.clone(),
                SM,
                color,
            )));
        }
        div()
            .w_full()
            .flex()
            .flex_col()
            .gap(px(8.0))
            .child(
                div().relative().h(px(22.0)).w_full().child(
                    canvas(
                        move |bounds, _, _| bounds,
                        move |bounds, _, window, _| {
                            paint::paint_timeline(
                                window,
                                bounds,
                                count,
                                current,
                                done,
                                pending,
                                theme::color::INK,
                            )
                        },
                    )
                    .absolute()
                    .inset_0(),
                ),
            )
            .child(labels)
    }
}

/// Keyboard-complete tabs: arrows move and select, Home/End jump, Enter/Space
/// reselect. The visual is a paper tab with a mustard scribble underline.
#[derive(IntoElement)]
pub struct PlopTabs {
    id: SharedString,
    tabs: Vec<SharedString>,
    selected: usize,
    focuses: Vec<FocusHandle>,
    theme: PlopTheme,
    on_select: Option<SelectHandler>,
}

impl PlopTabs {
    pub fn new(
        id: impl Into<SharedString>,
        tabs: Vec<SharedString>,
        selected: usize,
        focuses: Vec<FocusHandle>,
        theme: PlopTheme,
    ) -> Self {
        Self {
            id: id.into(),
            tabs,
            selected,
            focuses,
            theme,
            on_select: None,
        }
    }

    pub fn on_select(mut self, handler: impl Fn(usize, &mut Window, &mut App) + 'static) -> Self {
        self.on_select = Some(Rc::new(handler));
        self
    }
}

impl RenderOnce for PlopTabs {
    fn render(self, _window: &mut Window, _cx: &mut App) -> impl IntoElement {
        let count = self.tabs.len();
        let selected = self.selected.min(count.saturating_sub(1));
        let mode = self.theme.mode();
        let mut row = div()
            .id(ElementId::Name(format!("{}-list", self.id).into()))
            .role(Role::TabList)
            .flex()
            .items_end()
            .gap(px(4.0))
            .w_full();
        for (index, text) in self.tabs.into_iter().enumerate() {
            let focus = self.focuses.get(index).cloned();
            let on_select = self.on_select.clone();
            let is_selected = index == selected;
            let color = if is_selected { mode.on } else { mode.on_soft };
            let mut tab = div()
                .id(ElementId::Name(format!("{}-{index}", self.id).into()))
                .role(Role::Tab)
                .aria_selected(is_selected)
                .flex()
                .flex_col()
                .items_center()
                .gap(px(6.0))
                .px(px(16.0))
                .py(px(9.0))
                .cursor_pointer();
            if let Some(focus) = focus.clone() {
                tab = tab.track_focus(&focus).tab_stop(true).on_key_down({
                    let focuses = self.focuses.clone();
                    let on_select = on_select.clone();
                    move |event, window, cx| {
                        if count == 0 {
                            return;
                        }
                        let target = match event.keystroke.key.as_str() {
                            "left" | "up" => Some((index + count - 1) % count),
                            "right" | "down" => Some((index + 1) % count),
                            "home" => Some(0),
                            "end" => Some(count - 1),
                            "enter" | "space" => Some(index),
                            _ => None,
                        };
                        let Some(target) = target else {
                            return;
                        };
                        if let Some(target_focus) = focuses.get(target) {
                            window.focus(target_focus, cx);
                        }
                        if let Some(handler) = on_select.clone() {
                            handler(target, window, cx);
                        }
                        cx.stop_propagation();
                    }
                });
            }
            if let Some(focus) = focus {
                let on_select = on_select.clone();
                tab = tab.on_click(move |_, window, cx| {
                    window.focus(&focus, cx);
                    if let Some(handler) = on_select.clone() {
                        handler(index, window, cx);
                    }
                });
            }
            tab = tab.aria_label(text.clone());
            tab = tab.child(body_text(text, MD, color));
            if is_selected {
                tab = tab.child(
                    div().relative().w_full().h(px(7.0)).child(
                        canvas(
                            |bounds, _, _| bounds,
                            move |bounds, _, window, _| {
                                paint::paint_underline(window, bounds, theme::color::MUSTARD)
                            },
                        )
                        .absolute()
                        .inset_0(),
                    ),
                );
            } else {
                tab = tab.child(div().h(px(7.0)));
            }
            row = row.child(tab);
        }
        row
    }
}

/// Multi-line text on a cream sheet. The base textarea owns editing, undo and
/// IME; PlopUI owns the paper and the label.
#[derive(IntoElement)]
pub struct PlopTextArea {
    state: Entity<base::input::TextareaState>,
    seed: SharedString,
    label: SharedString,
    hint: Option<SharedString>,
    theme: PlopTheme,
}

impl PlopTextArea {
    pub fn new(
        state: Entity<base::input::TextareaState>,
        label: impl Into<SharedString>,
        theme: PlopTheme,
    ) -> Self {
        let label = label.into();
        Self {
            state,
            seed: label.clone(),
            label,
            hint: None,
            theme,
        }
    }

    pub fn hint(mut self, hint: impl Into<SharedString>) -> Self {
        self.hint = Some(hint.into());
        self
    }
}

impl RenderOnce for PlopTextArea {
    fn render(self, window: &mut Window, cx: &mut App) -> impl IntoElement {
        let focus = self.state.read(cx).focus_handle(cx).clone();
        let focused = focus.is_focused(window);
        let seed = self.seed.clone();
        let focus_color = self.theme.mode().focus;
        let hint = self.hint;
        let ink = theme::color::INK_TEXT;
        let mut column = div()
            .flex()
            .flex_col()
            .gap(px(8.0))
            .child(label(
                self.label,
                SM,
                theme::color::INK,
                FontWeight(WEIGHT_LETTER as f32),
            ))
            .child(
                div()
                    .relative()
                    .h(px(150.0))
                    .w_full()
                    .child(
                        canvas(
                            move |bounds, _, _| bounds,
                            move |bounds, _, window, _| {
                                paint::paint_field(
                                    window,
                                    bounds,
                                    &seed,
                                    focus_color,
                                    focused,
                                    false,
                                )
                            },
                        )
                        .absolute()
                        .inset_0(),
                    )
                    .child(
                        div()
                            .absolute()
                            .inset_0()
                            .px(px(18.0))
                            .py(px(14.0))
                            .font_family(FONT)
                            .text_size(px(18.0))
                            .text_color(to_hsla(ink))
                            .child(base::input::Textarea::new(&self.state)),
                    ),
            );
        if let Some(hint) = hint {
            column = column.child(body_text(hint, 16.5, theme::color::INK_SOFT));
        }
        column
    }
}

/// A single-value slider with a hand-drawn bar and a sticker thumb. Arrow
/// keys, Home/End and assistive increment/decrement all move the same state.
#[derive(IntoElement)]
pub struct PlopSlider {
    state: Entity<base::slider::SliderState>,
    label: SharedString,
    focus: FocusHandle,
    disabled: bool,
    theme: PlopTheme,
}

impl PlopSlider {
    pub fn new(
        state: Entity<base::slider::SliderState>,
        label: impl Into<SharedString>,
        focus: FocusHandle,
        theme: PlopTheme,
    ) -> Self {
        Self {
            state,
            label: label.into(),
            focus,
            disabled: false,
            theme,
        }
    }

    pub fn disabled(mut self, disabled: bool) -> Self {
        self.disabled = disabled;
        self
    }
}

impl RenderOnce for PlopSlider {
    fn render(self, window: &mut Window, cx: &mut App) -> impl IntoElement {
        let percent = self.state.read(cx).percentage().end;
        let value = self.state.read(cx).value().end();
        let min = self.state.read(cx).min_value();
        let max = self.state.read(cx).max_value();
        let step = self.state.read(cx).step_value();
        let focused = self.focus.is_focused(window);
        let focus_color = self.theme.mode().focus;
        let disabled = self.disabled;
        let state = self.state.clone();
        let label_color = if disabled {
            theme::color::INK_SOFT
        } else {
            theme::color::INK_TEXT
        };

        let track = base::slider::SliderTrack::new(&self.state)
            .flex()
            .items_center()
            .w_full()
            .h(px(36.0))
            .flex_shrink_0()
            .child(
                base::slider::SliderIndicator::new(&self.state)
                    .relative()
                    .w_full()
                    .h(px(26.0))
                    .child(
                        canvas(
                            move |bounds, _, _| bounds,
                            move |bounds, _, window, _| {
                                paint::paint_progress(window, bounds, percent, Fill::Mustard)
                            },
                        )
                        .absolute()
                        .inset_0(),
                    )
                    .when(focused, |element| {
                        element.child(
                            canvas(
                                move |bounds, _, _| bounds,
                                move |bounds, _, window, _| {
                                    paint::paint_focus_ring(
                                        window,
                                        bounds,
                                        focus_color,
                                        "slider-focus",
                                    )
                                },
                            )
                            .absolute()
                            .inset_0(),
                        )
                    })
                    .child(
                        base::slider::SliderThumb::new(&state)
                            .disabled(disabled)
                            .absolute()
                            .top(px(0.0))
                            .left(relative(percent))
                            .ml(-px(14.0))
                            .size(px(28.0))
                            .child(
                                canvas(
                                    |bounds, _, _| bounds,
                                    move |bounds, _, window, _| {
                                        paint::paint_dot(
                                            window,
                                            bounds,
                                            Fill::Mustard.color(),
                                            "slider-thumb",
                                        )
                                    },
                                )
                                .absolute()
                                .inset_0(),
                            ),
                    ),
            );

        let control = div()
            .relative()
            .w_full()
            .h(px(40.0))
            .flex()
            .items_center()
            .track_focus(&self.focus)
            .tab_stop(true)
            .on_mouse_down(MouseButton::Left, {
                let focus = self.focus.clone();
                move |_, window, cx| {
                    window.focus(&focus, cx);
                }
            })
            .on_key_down({
                let state = state.clone();
                move |event, window, cx| {
                    let delta = match event.keystroke.key.as_str() {
                        "left" | "down" => -step,
                        "right" | "up" => step,
                        "home" => min - state.read(cx).value().end(),
                        "end" => max - state.read(cx).value().end(),
                        _ => return,
                    };
                    let next = (state.read(cx).value().end() + delta).clamp(min, max);
                    state.update(cx, |state, cx| {
                        state.set_value(next, window, cx);
                    });
                    cx.stop_propagation();
                }
            })
            .child(
                base::slider::Slider::new(&self.state)
                    .disabled(disabled)
                    .accessibility_label(self.label.clone())
                    .w_full()
                    .child(track),
            );

        div()
            .flex()
            .flex_col()
            .gap(px(10.0))
            .w_full()
            .child(
                div()
                    .flex()
                    .items_center()
                    .justify_between()
                    .child(label(
                        self.label.clone(),
                        SM,
                        label_color,
                        FontWeight(WEIGHT_LETTER as f32),
                    ))
                    .child(body_text(format!("{value:.0}"), MD, label_color)),
            )
            .child(control)
    }
}

/// A standalone status dot. The label is exposed to accessibility clients,
/// while visual users get color plus the surrounding text where one is used.
#[derive(IntoElement)]
pub struct PlopStatusDot {
    id: ElementId,
    status: Status,
    size: f32,
}

impl PlopStatusDot {
    pub fn new(id: impl Into<ElementId>, status: Status) -> Self {
        Self {
            id: id.into(),
            status,
            size: 14.0,
        }
    }

    pub fn size(mut self, size: f32) -> Self {
        self.size = size;
        self
    }
}

impl RenderOnce for PlopStatusDot {
    fn render(self, _window: &mut Window, _cx: &mut App) -> impl IntoElement {
        let color = self.status.fill().color();
        let size = self.size;
        let seed = self.status.label().to_string();
        div()
            .id(self.id)
            .role(Role::Image)
            .aria_label(self.status.label())
            .relative()
            .size(px(size))
            .child(
                canvas(
                    move |bounds, _, _| bounds,
                    move |bounds, _, window, _| paint::paint_dot(window, bounds, color, &seed),
                )
                .absolute()
                .inset_0(),
            )
    }
}

/// A ring progress meter with the percentage in the middle.
#[derive(IntoElement)]
pub struct PlopProgressRing {
    ratio: f32,
    size: f32,
    fill: Fill,
    seed: SharedString,
    label: Option<SharedString>,
    theme: PlopTheme,
}

impl PlopProgressRing {
    pub fn new(ratio: f32, theme: PlopTheme) -> Self {
        Self {
            ratio,
            size: 104.0,
            fill: Fill::Mint,
            seed: "progress-ring".into(),
            label: None,
            theme,
        }
    }

    pub fn size(mut self, size: f32) -> Self {
        self.size = size;
        self
    }

    pub fn fill(mut self, fill: Fill) -> Self {
        self.fill = fill;
        self
    }

    pub fn label(mut self, label: impl Into<SharedString>) -> Self {
        self.label = Some(label.into());
        self
    }

    pub fn seed(mut self, seed: impl Into<SharedString>) -> Self {
        self.seed = seed.into();
        self
    }
}

impl RenderOnce for PlopProgressRing {
    fn render(self, _window: &mut Window, _cx: &mut App) -> impl IntoElement {
        let ratio = self.ratio.clamp(0.0, 1.0);
        let percent = (ratio * 100.0).round() as i32;
        let size = self.size;
        let fill = self.fill;
        let seed = self.seed;
        let mode = self.theme.mode();
        let mut column = div().flex().flex_col().items_center().gap(px(8.0)).child(
            div()
                .relative()
                .size(px(size))
                .flex()
                .items_center()
                .justify_center()
                .child(
                    canvas(
                        move |bounds, _, _| bounds,
                        move |bounds, _, window, _| {
                            paint::paint_progress_ring(window, bounds, ratio, fill, &seed)
                        },
                    )
                    .absolute()
                    .inset_0(),
                )
                .child(
                    div()
                        .font_family(FONT)
                        .text_size(px(size * 0.24))
                        .font_weight(FontWeight(WEIGHT_HEADING as f32))
                        .italic()
                        .text_color(to_hsla(mode.on))
                        .child(format!("{percent}%")),
                ),
        );
        if let Some(label) = self.label {
            column = column.child(meta_text(label, mode.on_soft));
        }
        column
    }
}

/// Multi-line skeleton: a stack of bars with seeded widths.
#[derive(IntoElement)]
pub struct PlopSkeletonText {
    width: f32,
    lines: usize,
    seed: SharedString,
    theme: PlopTheme,
}

impl PlopSkeletonText {
    pub fn new(width: f32, lines: usize, seed: impl Into<SharedString>, theme: PlopTheme) -> Self {
        Self {
            width,
            lines,
            seed: seed.into(),
            theme,
        }
    }
}

impl RenderOnce for PlopSkeletonText {
    fn render(self, _window: &mut Window, _cx: &mut App) -> impl IntoElement {
        let mut column = div().flex().flex_col().gap(px(8.0));
        for index in 0..self.lines.max(1) {
            let factor = 1.0 - index as f32 * 0.09;
            column = column.child(PlopSkeleton::new(
                (self.width * factor).max(40.0),
                15.0,
                format!("{}-{index}", self.seed),
                self.theme,
            ));
        }
        column
    }
}

/// A small ETA tag, e.g. "12 min".
#[derive(IntoElement)]
pub struct PlopEta {
    text: SharedString,
    seed: SharedString,
}

impl PlopEta {
    pub fn new(text: impl Into<SharedString>) -> Self {
        let text = text.into();
        Self {
            seed: text.clone(),
            text,
        }
    }
}

impl RenderOnce for PlopEta {
    fn render(self, _window: &mut Window, _cx: &mut App) -> impl IntoElement {
        let seed = self.seed;
        div()
            .relative()
            .px(px(12.0))
            .py(px(5.0))
            .child(
                canvas(
                    move |bounds, _, _| bounds,
                    move |bounds, _, window, _| {
                        paint::paint_tag(window, bounds, &seed, Fill::Plain, false)
                    },
                )
                .absolute()
                .inset_0(),
            )
            .child(
                div()
                    .relative()
                    .font_family(FONT)
                    .text_size(px(15.0))
                    .font_weight(FontWeight(WEIGHT_LETTER as f32))
                    .italic()
                    .text_color(to_hsla(theme::color::INK_TEXT))
                    .child(self.text),
            )
    }
}

/// A display word on a die-cut sticker.
#[derive(IntoElement)]
pub struct PlopWordSticker {
    text: SharedString,
    fill: Fill,
    seed: SharedString,
}

impl PlopWordSticker {
    pub fn new(text: impl Into<SharedString>, fill: Fill) -> Self {
        let text = text.into();
        Self {
            seed: text.clone(),
            text,
            fill,
        }
    }
}

impl RenderOnce for PlopWordSticker {
    fn render(self, _window: &mut Window, _cx: &mut App) -> impl IntoElement {
        let fill = self.fill;
        let text_color = fill.on_fill();
        let seed = self.seed;
        div()
            .relative()
            .px(px(22.0))
            .py(px(12.0))
            .child(
                canvas(
                    move |bounds, _, _| bounds,
                    move |bounds, _, window, _| {
                        let spec = StickerSpec {
                            seed: seed.clone(),
                            fill,
                            focus_color: theme::color::INK,
                            focused: false,
                            disabled: false,
                            flat: false,
                        };
                        paint::paint_sticker(window, bounds, &spec);
                    },
                )
                .absolute()
                .inset_0(),
            )
            .child(
                div()
                    .relative()
                    .font_family(FONT)
                    .text_size(px(22.0))
                    .font_weight(FontWeight(WEIGHT_HEADING as f32))
                    .italic()
                    .text_color(to_hsla(text_color))
                    .child(self.text.to_uppercase()),
            )
    }
}

/// Larger marker lettering, optionally underlined.
#[derive(IntoElement)]
pub struct PlopLettering {
    text: SharedString,
    size: f32,
    underline: bool,
    theme: PlopTheme,
}

impl PlopLettering {
    pub fn new(text: impl Into<SharedString>, theme: PlopTheme) -> Self {
        Self {
            text: text.into(),
            size: 52.0,
            underline: true,
            theme,
        }
    }

    pub fn size(mut self, size: f32) -> Self {
        self.size = size;
        self
    }

    pub fn underline(mut self, underline: bool) -> Self {
        self.underline = underline;
        self
    }
}

impl RenderOnce for PlopLettering {
    fn render(self, _window: &mut Window, _cx: &mut App) -> impl IntoElement {
        let color = self.theme.mode().on;
        let size = self.size;
        let mut column = div().flex().flex_col().items_start().gap(px(4.0)).child(
            div()
                .font_family(FONT)
                .text_size(px(size))
                .font_weight(FontWeight(900.0))
                .italic()
                .text_color(to_hsla(color))
                .child(self.text),
        );
        if self.underline {
            column = column.child(
                div().relative().w(px(size * 4.2)).h(px(8.0)).child(
                    canvas(
                        |bounds, _, _| bounds,
                        move |bounds, _, window, _| {
                            paint::paint_underline(window, bounds, theme::color::TOMATO)
                        },
                    )
                    .absolute()
                    .inset_0(),
                ),
            );
        }
        column
    }
}

/// Doodles for empty corners and margins.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum DoodleKind {
    Star,
    Arrow,
    Squiggle,
    Heart,
    Sparkle,
}

impl DoodleKind {
    pub const ALL: [DoodleKind; 5] = [
        DoodleKind::Star,
        DoodleKind::Arrow,
        DoodleKind::Squiggle,
        DoodleKind::Heart,
        DoodleKind::Sparkle,
    ];
}

#[derive(IntoElement)]
pub struct PlopDoodle {
    kind: DoodleKind,
    size: f32,
    color: Rgb,
}

impl PlopDoodle {
    pub fn new(kind: DoodleKind) -> Self {
        Self {
            kind,
            size: 48.0,
            color: theme::color::INK,
        }
    }

    pub fn size(mut self, size: f32) -> Self {
        self.size = size;
        self
    }

    pub fn color(mut self, color: Rgb) -> Self {
        self.color = color;
        self
    }
}

impl RenderOnce for PlopDoodle {
    fn render(self, _window: &mut Window, _cx: &mut App) -> impl IntoElement {
        let kind = self.kind;
        let color = self.color;
        div().relative().size(px(self.size)).child(
            canvas(
                move |bounds, _, _| bounds,
                move |bounds, _, window, _| paint::paint_doodle(window, bounds, kind, color),
            )
            .absolute()
            .inset_0(),
        )
    }
}

/// A paper sheet with padding and an optional title.
#[derive(IntoElement)]
pub struct PlopSheet {
    seed: SharedString,
    title: Option<SharedString>,
    theme: PlopTheme,
    children: Vec<AnyElement>,
}

impl PlopSheet {
    pub fn new(seed: impl Into<SharedString>, theme: PlopTheme) -> Self {
        Self {
            seed: seed.into(),
            title: None,
            theme,
            children: Vec::new(),
        }
    }

    pub fn title(mut self, title: impl Into<SharedString>) -> Self {
        self.title = Some(title.into());
        self
    }
}

impl ParentElement for PlopSheet {
    fn extend(&mut self, elements: impl IntoIterator<Item = AnyElement>) {
        self.children.extend(elements);
    }
}

impl RenderOnce for PlopSheet {
    fn render(self, _window: &mut Window, _cx: &mut App) -> impl IntoElement {
        let seed = self.seed;
        let mode = self.theme.mode();
        let mut column = div()
            .relative()
            .w_full()
            .p(px(28.0))
            .flex()
            .flex_col()
            .gap(px(12.0))
            .text_color(to_hsla(theme::color::INK_TEXT))
            .child(
                canvas(
                    move |bounds, _, _| bounds,
                    move |bounds, _, window, _| {
                        paint::paint_paper_card(window, bounds, &seed, mode, false)
                    },
                )
                .absolute()
                .inset_0(),
            );
        if let Some(title) = self.title {
            column = column.child(label(
                title,
                28.0,
                theme::color::INK,
                FontWeight(WEIGHT_HEADING as f32),
            ));
        }
        column.children(self.children)
    }
}

/// Breadcrumb trail; the last item is the current page.
#[derive(IntoElement)]
pub struct PlopBreadcrumb {
    items: Vec<SharedString>,
    theme: PlopTheme,
}

impl PlopBreadcrumb {
    pub fn new<I, S>(items: I, theme: PlopTheme) -> Self
    where
        I: IntoIterator<Item = S>,
        S: Into<SharedString>,
    {
        Self {
            items: items.into_iter().map(Into::into).collect(),
            theme,
        }
    }
}

impl RenderOnce for PlopBreadcrumb {
    fn render(self, _window: &mut Window, _cx: &mut App) -> impl IntoElement {
        let mode = self.theme.mode();
        let last = self.items.len().saturating_sub(1);
        let mut row = div().flex().items_center().gap(px(8.0));
        for (index, item) in self.items.into_iter().enumerate() {
            if index > 0 {
                row = row.child(body_text("/", SM, mode.on_soft));
            }
            let color = if index == last { mode.on } else { mode.on_soft };
            row = row.child(body_text(item, SM, color));
        }
        row
    }
}

/// A taped sticky note.
#[derive(IntoElement)]
pub struct PlopStickyNote {
    seed: SharedString,
    title: Option<SharedString>,
    body: Option<SharedString>,
    theme: PlopTheme,
    children: Vec<AnyElement>,
}

impl PlopStickyNote {
    pub fn new(seed: impl Into<SharedString>, theme: PlopTheme) -> Self {
        Self {
            seed: seed.into(),
            title: None,
            body: None,
            theme,
            children: Vec::new(),
        }
    }

    pub fn title(mut self, title: impl Into<SharedString>) -> Self {
        self.title = Some(title.into());
        self
    }

    pub fn body(mut self, body: impl Into<SharedString>) -> Self {
        self.body = Some(body.into());
        self
    }
}

impl ParentElement for PlopStickyNote {
    fn extend(&mut self, elements: impl IntoIterator<Item = AnyElement>) {
        self.children.extend(elements);
    }
}

impl RenderOnce for PlopStickyNote {
    fn render(self, _window: &mut Window, _cx: &mut App) -> impl IntoElement {
        let seed = self.seed;
        let mode = self.theme.mode();
        let mut column = div()
            .relative()
            .p(px(24.0))
            .flex()
            .flex_col()
            .gap(px(8.0))
            .text_color(to_hsla(theme::color::INK_TEXT))
            .child(
                canvas(
                    move |bounds, _, _| bounds,
                    move |bounds, _, window, _| {
                        paint::paint_paper_card(window, bounds, &seed, mode, true)
                    },
                )
                .absolute()
                .inset_0(),
            );
        if let Some(title) = self.title {
            column = column.child(label(
                title,
                22.0,
                theme::color::INK,
                FontWeight(WEIGHT_HEADING as f32),
            ));
        }
        if let Some(body) = self.body {
            column = column.child(body_text(body, BODY, theme::color::INK_TEXT));
        }
        column.children(self.children)
    }
}

/// A ticket stub with a dashed perforation and an optional status.
#[derive(IntoElement)]
pub struct PlopTicketCard {
    seed: SharedString,
    title: SharedString,
    code: Option<SharedString>,
    status: Option<Status>,
    theme: PlopTheme,
    children: Vec<AnyElement>,
}

impl PlopTicketCard {
    pub fn new(
        seed: impl Into<SharedString>,
        title: impl Into<SharedString>,
        theme: PlopTheme,
    ) -> Self {
        Self {
            seed: seed.into(),
            title: title.into(),
            code: None,
            status: None,
            theme,
            children: Vec::new(),
        }
    }

    pub fn code(mut self, code: impl Into<SharedString>) -> Self {
        self.code = Some(code.into());
        self
    }

    pub fn status(mut self, status: Status) -> Self {
        self.status = Some(status);
        self
    }
}

impl ParentElement for PlopTicketCard {
    fn extend(&mut self, elements: impl IntoIterator<Item = AnyElement>) {
        self.children.extend(elements);
    }
}

impl RenderOnce for PlopTicketCard {
    fn render(self, _window: &mut Window, _cx: &mut App) -> impl IntoElement {
        let seed = self.seed;
        let mode = self.theme.mode();
        let perforation_seed = format!("{seed}-perf");
        let mut column = div()
            .relative()
            .p(px(24.0))
            .flex()
            .flex_col()
            .gap(px(12.0))
            .text_color(to_hsla(theme::color::INK_TEXT))
            .child(
                canvas(
                    move |bounds, _, _| bounds,
                    move |bounds, _, window, _| {
                        paint::paint_paper_card(window, bounds, &seed, mode, false)
                    },
                )
                .absolute()
                .inset_0(),
            )
            .child(
                div()
                    .flex()
                    .items_start()
                    .justify_between()
                    .gap(px(12.0))
                    .child(label(
                        self.title,
                        24.0,
                        theme::color::INK,
                        FontWeight(WEIGHT_HEADING as f32),
                    ))
                    .when_some(self.status, |row, status| {
                        row.child(PlopStatus::new(status, self.theme.on_paper()))
                    }),
            );
        if let Some(code) = self.code {
            column = column.child(meta_text(code, theme::color::INK_SOFT));
        }
        column = column.child(
            div().relative().h(px(14.0)).w_full().child(
                canvas(
                    move |bounds, _, _| bounds,
                    move |bounds, _, window, _| {
                        paint::paint_perforation(window, bounds, &perforation_seed)
                    },
                )
                .absolute()
                .inset_0(),
            ),
        );
        column.children(self.children)
    }
}

/// A unit row card: name, detail, status and ETA.
#[derive(IntoElement)]
pub struct PlopUnitCard {
    seed: SharedString,
    name: SharedString,
    detail: Option<SharedString>,
    status: Option<Status>,
    eta: Option<SharedString>,
    theme: PlopTheme,
}

impl PlopUnitCard {
    pub fn new(
        seed: impl Into<SharedString>,
        name: impl Into<SharedString>,
        theme: PlopTheme,
    ) -> Self {
        Self {
            seed: seed.into(),
            name: name.into(),
            detail: None,
            status: None,
            eta: None,
            theme,
        }
    }

    pub fn detail(mut self, detail: impl Into<SharedString>) -> Self {
        self.detail = Some(detail.into());
        self
    }

    pub fn status(mut self, status: Status) -> Self {
        self.status = Some(status);
        self
    }

    pub fn eta(mut self, eta: impl Into<SharedString>) -> Self {
        self.eta = Some(eta.into());
        self
    }
}

impl RenderOnce for PlopUnitCard {
    fn render(self, _window: &mut Window, _cx: &mut App) -> impl IntoElement {
        // A free unit has no status color, but it still gets a face so the
        // rows line up; periwinkle is the neutral paper fill.
        let fill = self
            .status
            .map(|status| status.fill())
            .unwrap_or(Fill::Periwinkle);
        let seed = self.seed;
        let mode = self.theme.mode();
        let mut row = div()
            .relative()
            .p(px(20.0))
            .flex()
            .items_center()
            .gap(px(14.0))
            .text_color(to_hsla(theme::color::INK_TEXT))
            .child(
                canvas(
                    move |bounds, _, _| bounds,
                    move |bounds, _, window, _| {
                        paint::paint_paper_card(window, bounds, &seed, mode, false)
                    },
                )
                .absolute()
                .inset_0(),
            )
            .child(
                PlopAvatar::new(self.name.chars().take(2).collect::<String>())
                    .initials()
                    .fill(fill)
                    .size(40.0),
            );
        row = row.child(
            div()
                .flex()
                .flex_col()
                .child(label(
                    self.name,
                    20.0,
                    theme::color::INK,
                    FontWeight(WEIGHT_HEADING as f32),
                ))
                .when_some(self.detail, |column, detail| {
                    column.child(body_text(detail, 16.0, theme::color::INK_SOFT))
                }),
        );
        row = row.child(div().flex_1());
        if let Some(eta) = self.eta {
            row = row.child(PlopEta::new(eta));
        }
        if let Some(status) = self.status {
            row = row.child(PlopStatus::new(status, self.theme.on_paper()));
        }
        row
    }
}

/// A horizontal row of unit cards.
#[derive(IntoElement)]
pub struct PlopUnitCardRow {
    children: Vec<AnyElement>,
}

impl PlopUnitCardRow {
    pub fn new() -> Self {
        Self {
            children: Vec::new(),
        }
    }
}

impl Default for PlopUnitCardRow {
    fn default() -> Self {
        Self::new()
    }
}

impl ParentElement for PlopUnitCardRow {
    fn extend(&mut self, elements: impl IntoIterator<Item = AnyElement>) {
        self.children.extend(elements);
    }
}

impl RenderOnce for PlopUnitCardRow {
    fn render(self, _window: &mut Window, _cx: &mut App) -> impl IntoElement {
        div()
            .flex()
            .items_stretch()
            .gap(px(14.0))
            .w_full()
            .children(self.children)
    }
}

/// Spinner plus a label.
#[derive(IntoElement)]
pub struct PlopLoader {
    label: SharedString,
    seed: SharedString,
    theme: PlopTheme,
}

impl PlopLoader {
    pub fn new(label: impl Into<SharedString>, theme: PlopTheme) -> Self {
        Self {
            label: label.into(),
            seed: "loader".into(),
            theme,
        }
    }

    pub fn seed(mut self, seed: impl Into<SharedString>) -> Self {
        self.seed = seed.into();
        self
    }
}

impl RenderOnce for PlopLoader {
    fn render(self, _window: &mut Window, _cx: &mut App) -> impl IntoElement {
        let seed = self.seed;
        div()
            .flex()
            .items_center()
            .gap(px(10.0))
            .child(PlopSpinner::new(("loader", 0usize)).size(26.0).seed(seed))
            .child(body_text(self.label, MD, self.theme.mode().on))
    }
}

/// A head peeking over an edge.
#[derive(IntoElement)]
pub struct PlopBuddyPeek {
    mood: BuddyMood,
    size: f32,
    seed: SharedString,
}

impl PlopBuddyPeek {
    pub fn new(mood: BuddyMood) -> Self {
        Self {
            mood,
            size: 96.0,
            seed: format!("peek-{}", mood.label()).into(),
        }
    }

    pub fn size(mut self, size: f32) -> Self {
        self.size = size;
        self
    }
}

impl RenderOnce for PlopBuddyPeek {
    fn render(self, _window: &mut Window, _cx: &mut App) -> impl IntoElement {
        let mood = self.mood;
        let seed = self.seed;
        let size = self.size;
        div()
            .id(ElementId::Name(format!("{seed}-peek").into()))
            .role(Role::Image)
            .aria_label(format!("{} buddy peeking", mood.label()))
            .relative()
            .w(px(size))
            .h(px(size * 0.62))
            .child(
                canvas(
                    move |bounds, _, _| bounds,
                    move |bounds, _, window, _| {
                        paint::paint_buddy_peek(window, bounds, mood, &seed)
                    },
                )
                .absolute()
                .inset_0(),
            )
    }
}

/// The cast table: name plus mood, matching the React kit.
pub const BUDDY_CAST: [(&str, BuddyMood); 6] = [
    ("Pip", BuddyMood::Success),
    ("Bix", BuddyMood::Error),
    ("Snooze", BuddyMood::Stale),
    ("Confetti", BuddyMood::Congrats),
    ("Specs", BuddyMood::Preview),
    ("Hum", BuddyMood::Thinking),
];

/// Panel content for `PlopTabs`; render one per index.
#[derive(IntoElement)]
pub struct PlopTabPanel {
    index: usize,
    selected: usize,
    children: Vec<AnyElement>,
}

impl PlopTabPanel {
    pub fn new(index: usize, selected: usize) -> Self {
        Self {
            index,
            selected,
            children: Vec::new(),
        }
    }
}

impl ParentElement for PlopTabPanel {
    fn extend(&mut self, elements: impl IntoIterator<Item = AnyElement>) {
        self.children.extend(elements);
    }
}

impl RenderOnce for PlopTabPanel {
    fn render(self, _window: &mut Window, _cx: &mut App) -> impl IntoElement {
        if self.index == self.selected {
            div().children(self.children)
        } else {
            div()
        }
    }
}

type ItemHandler = Rc<dyn Fn(usize, &mut Window, &mut App)>;
type OpenHandler = Rc<dyn Fn(bool, &mut Window, &mut App)>;

/// A text link with the hand-drawn underline. Enter activates; Space scrolls,
/// as a link should, so it is deliberately not a button.
#[derive(IntoElement)]
pub struct PlopButtonLink {
    label: SharedString,
    focus: FocusHandle,
    theme: PlopTheme,
    on_click: Option<ActionHandler>,
}

impl PlopButtonLink {
    pub fn new(label: impl Into<SharedString>, focus: FocusHandle, theme: PlopTheme) -> Self {
        Self {
            label: label.into(),
            focus,
            theme,
            on_click: None,
        }
    }

    pub fn on_click(mut self, handler: impl Fn(&mut Window, &mut App) + 'static) -> Self {
        self.on_click = Some(Rc::new(handler));
        self
    }
}

impl RenderOnce for PlopButtonLink {
    fn render(self, window: &mut Window, _cx: &mut App) -> impl IntoElement {
        let focused = self.focus.is_focused(window);
        let mode = self.theme.mode();
        let color = if focused { mode.focus } else { mode.on };
        let label = self.label;
        let underline_seed = label.clone();
        let mut link = div()
            .id(ElementId::Name(format!("link-{underline_seed}").into()))
            .role(Role::Link)
            .aria_label(label.clone())
            .track_focus(&self.focus)
            .tab_stop(true)
            .flex()
            .flex_col()
            .items_start()
            .gap(px(2.0))
            .cursor_pointer()
            .on_key_down({
                let handler = self.on_click.clone();
                move |event, window, cx| {
                    if event.keystroke.key == "enter" {
                        if let Some(handler) = handler.clone() {
                            handler(window, cx);
                        }
                        cx.stop_propagation();
                    }
                }
            })
            .child(
                div()
                    .font_family(FONT)
                    .text_size(px(19.0))
                    .font_weight(FontWeight(WEIGHT_BODY as f32))
                    .text_color(to_hsla(color))
                    .child(label),
            )
            .child(
                div().relative().w_full().h(px(6.0)).child(
                    canvas(
                        |bounds, _, _| bounds,
                        move |bounds, _, window, _| paint::paint_underline(window, bounds, color),
                    )
                    .absolute()
                    .inset_0(),
                ),
            );
        if let Some(handler) = self.on_click {
            link = link.on_mouse_up(MouseButton::Left, move |_, window, cx| handler(window, cx));
        }
        link
    }
}

/// A square sticker button for a glyph. The `label` is the accessible name;
/// the `glyph` is what sighted users see.
#[derive(IntoElement)]
pub struct PlopIconButton {
    id: ElementId,
    label: SharedString,
    glyph: SharedString,
    icon: Option<IconKind>,
    focus: FocusHandle,
    theme: PlopTheme,
    fill: Fill,
    disabled: bool,
    on_click: Option<ClickHandler>,
}

impl PlopIconButton {
    pub fn new(
        id: impl Into<ElementId>,
        label: impl Into<SharedString>,
        glyph: impl Into<SharedString>,
        focus: FocusHandle,
        theme: PlopTheme,
    ) -> Self {
        Self {
            id: id.into(),
            label: label.into(),
            glyph: glyph.into(),
            icon: None,
            focus,
            theme,
            fill: Fill::Plain,
            disabled: false,
            on_click: None,
        }
    }

    /// A sticker button that draws one of the 24 kit icons.
    pub fn with_icon(
        id: impl Into<ElementId>,
        label: impl Into<SharedString>,
        icon: IconKind,
        focus: FocusHandle,
        theme: PlopTheme,
    ) -> Self {
        let mut button = Self::new(id, label, "", focus, theme);
        button.icon = Some(icon);
        button
    }

    pub fn fill(mut self, fill: Fill) -> Self {
        self.fill = fill;
        self
    }

    pub fn disabled(mut self, disabled: bool) -> Self {
        self.disabled = disabled;
        self
    }

    pub fn on_click(
        mut self,
        handler: impl Fn(&ClickEvent, &mut Window, &mut App) + 'static,
    ) -> Self {
        self.on_click = Some(Rc::new(handler));
        self
    }
}

impl RenderOnce for PlopIconButton {
    fn render(self, window: &mut Window, _cx: &mut App) -> impl IntoElement {
        let focused = self.focus.is_focused(window);
        let focus_color = self.theme.mode().focus;
        let fill = self.fill;
        let text_color = fill.on_fill();
        let seed = self.label.clone();
        let disabled = self.disabled;
        let mut button = div()
            .id(self.id)
            .role(Role::Button)
            .aria_label(self.label)
            .track_focus(&self.focus)
            .tab_stop(!disabled)
            .relative()
            .size(px(48.0))
            .flex()
            .items_center()
            .justify_center()
            .when(!disabled, |button| button.cursor_pointer())
            .child(
                canvas(
                    move |bounds, _, _| bounds,
                    move |bounds, _, window, _| {
                        let spec = StickerSpec {
                            seed: seed.clone(),
                            fill,
                            focus_color,
                            focused,
                            disabled,
                            flat: false,
                        };
                        paint::paint_sticker(window, bounds, &spec);
                    },
                )
                .absolute()
                .inset_0(),
            )
            .child(if let Some(kind) = self.icon {
                PlopIcon::new(kind, self.theme)
                    .size(24.0)
                    .color(if disabled {
                        theme::color::INK_SOFT
                    } else {
                        text_color
                    })
                    .into_any_element()
            } else {
                div()
                    .relative()
                    .font_family(FONT)
                    .text_size(px(22.0))
                    .font_weight(FontWeight(WEIGHT_HEADING as f32))
                    .text_color(to_hsla(if disabled {
                        theme::color::INK_SOFT
                    } else {
                        text_color
                    }))
                    .child(self.glyph)
                    .into_any_element()
            });
        if let Some(handler) = self.on_click {
            let burst_color = self.theme.mode().on;
            button = button.on_click(move |event, window, cx| {
                if !disabled {
                    crate::ink::ink_burst(cx, event.position(), burst_color);
                    handler(event, window, cx);
                }
            });
        }
        button
    }
}

/// A controlled select. The trigger keeps focus while open, so Up/Down/Enter
/// and Escape work without moving focus into the popup.
#[derive(IntoElement)]
pub struct PlopSelect {
    id: ElementId,
    label: SharedString,
    options: Vec<SharedString>,
    selected: usize,
    open: bool,
    disabled: bool,
    focus: FocusHandle,
    theme: PlopTheme,
    on_select: Option<ItemHandler>,
    on_open_change: Option<OpenHandler>,
}

impl PlopSelect {
    pub fn new(
        id: impl Into<ElementId>,
        label: impl Into<SharedString>,
        options: Vec<SharedString>,
        selected: usize,
        open: bool,
        focus: FocusHandle,
        theme: PlopTheme,
    ) -> Self {
        Self {
            id: id.into(),
            label: label.into(),
            options,
            selected,
            open,
            disabled: false,
            focus,
            theme,
            on_select: None,
            on_open_change: None,
        }
    }

    pub fn disabled(mut self, disabled: bool) -> Self {
        self.disabled = disabled;
        self
    }

    pub fn on_select(mut self, handler: impl Fn(usize, &mut Window, &mut App) + 'static) -> Self {
        self.on_select = Some(Rc::new(handler));
        self
    }

    pub fn on_open_change(
        mut self,
        handler: impl Fn(bool, &mut Window, &mut App) + 'static,
    ) -> Self {
        self.on_open_change = Some(Rc::new(handler));
        self
    }
}

impl RenderOnce for PlopSelect {
    fn render(self, window: &mut Window, _cx: &mut App) -> impl IntoElement {
        let focused = self.focus.is_focused(window);
        let focus_color = self.theme.mode().focus;
        let disabled = self.disabled;
        let open = self.open && !disabled;
        let count = self.options.len();
        let selected = self.selected.min(count.saturating_sub(1));
        let current = self
            .options
            .get(selected)
            .cloned()
            .unwrap_or_else(|| "Select…".into());
        let seed = self.label.clone();
        let field_seed = format!("select-{seed}");
        let trigger = div()
            .id(self.id)
            .role(Role::ComboBox)
            .aria_label(self.label.clone())
            .aria_expanded(open)
            .track_focus(&self.focus)
            .tab_stop(!disabled)
            .relative()
            .h(px(54.0))
            .w_full()
            .flex()
            .items_center()
            .justify_between()
            .px(px(18.0))
            .when(!disabled, |trigger| trigger.cursor_pointer())
            .child(
                canvas(
                    move |bounds, _, _| bounds,
                    move |bounds, _, window, _| {
                        paint::paint_field(window, bounds, &field_seed, focus_color, focused, false)
                    },
                )
                .absolute()
                .inset_0(),
            )
            .child(
                div()
                    .relative()
                    .font_family(FONT)
                    .text_size(px(19.0))
                    .text_color(to_hsla(if disabled {
                        theme::color::INK_SOFT
                    } else {
                        theme::color::INK_TEXT
                    }))
                    .child(current),
            )
            .child(meta_text(if open { "▴" } else { "▾" }, theme::color::INK));
        let mut root = div()
            .relative()
            .w_full()
            .flex()
            .flex_col()
            .gap(px(8.0))
            .child(meta_text(self.label.clone(), self.theme.mode().on_soft));
        let trigger = trigger
            .on_mouse_up(MouseButton::Left, {
                let on_open = self.on_open_change.clone();
                move |_, window, cx| {
                    if disabled {
                        return;
                    }
                    if let Some(handler) = on_open.clone() {
                        handler(!open, window, cx);
                    }
                }
            })
            .on_key_down({
                let on_open = self.on_open_change.clone();
                let on_select = self.on_select.clone();
                let focus = self.focus.clone();
                move |event, window, cx| {
                    if disabled {
                        return;
                    }
                    let key = event.keystroke.key.as_str();
                    match key {
                        "space" | "enter" | "down" if !open => {
                            if let Some(handler) = on_open.clone() {
                                handler(true, window, cx);
                            }
                            cx.stop_propagation();
                        }
                        "down" => {
                            let next = (selected + 1) % count.max(1);
                            if let Some(handler) = on_select.clone() {
                                handler(next, window, cx);
                            }
                            cx.stop_propagation();
                        }
                        "up" => {
                            let next = if selected == 0 {
                                count.saturating_sub(1)
                            } else {
                                selected - 1
                            };
                            if let Some(handler) = on_select.clone() {
                                handler(next, window, cx);
                            }
                            cx.stop_propagation();
                        }
                        "enter" | "space" if open => {
                            if let Some(handler) = on_open.clone() {
                                handler(false, window, cx);
                            }
                            window.focus(&focus, cx);
                            cx.stop_propagation();
                        }
                        "escape" if open => {
                            if let Some(handler) = on_open.clone() {
                                handler(false, window, cx);
                            }
                            window.focus(&focus, cx);
                            cx.stop_propagation();
                        }
                        _ => {}
                    }
                }
            });
        root = root.child(trigger);
        if open {
            let mut list = div()
                .relative()
                .flex()
                .flex_col()
                .gap(px(2.0))
                .p(px(10.0))
                .child(
                    canvas(
                        |bounds, _, _| bounds,
                        move |bounds, _, window, _| {
                            paint::paint_paper_card(
                                window,
                                bounds,
                                "select-popup",
                                PlopTheme::default().mode(),
                                false,
                            )
                        },
                    )
                    .absolute()
                    .inset_0(),
                );
            for (index, option) in self.options.into_iter().enumerate() {
                let on_select = self.on_select.clone();
                let on_open = self.on_open_change.clone();
                let focus = self.focus.clone();
                let is_selected = index == selected;
                list = list.child(
                    div()
                        .id(ElementId::Name(format!("select-option-{index}").into()))
                        .role(Role::ListBoxOption)
                        .aria_selected(is_selected)
                        .relative()
                        .px(px(12.0))
                        .py(px(8.0))
                        .cursor_pointer()
                        .font_family(FONT)
                        .text_size(px(18.0))
                        .text_color(to_hsla(if is_selected {
                            theme::color::INK
                        } else {
                            theme::color::INK_SOFT
                        }))
                        .when(is_selected, |row| {
                            row.child(
                                canvas(
                                    |bounds, _, _| bounds,
                                    move |bounds, _, window, _| {
                                        paint::paint_underline(
                                            window,
                                            bounds,
                                            theme::color::MUSTARD,
                                        )
                                    },
                                )
                                .absolute()
                                .inset_0(),
                            )
                        })
                        .child(option)
                        .on_click(move |_, window, cx| {
                            if let Some(handler) = on_select.clone() {
                                handler(index, window, cx);
                            }
                            if let Some(handler) = on_open.clone() {
                                handler(false, window, cx);
                            }
                            window.focus(&focus, cx);
                        }),
                );
            }
            root = root.child(
                div()
                    .absolute()
                    .top(px(82.0))
                    .left_0()
                    .right_0()
                    .child(list),
            );
        }
        root
    }
}

/// A controlled multi-select. Every option owns a focus handle so Tab and
/// Space work without an internal highlight index.
#[derive(IntoElement)]
pub struct PlopMultiSelect {
    id: ElementId,
    label: SharedString,
    options: Vec<SharedString>,
    selected: Vec<bool>,
    open: bool,
    focus: FocusHandle,
    option_focuses: Vec<FocusHandle>,
    theme: PlopTheme,
    on_toggle: Option<ItemHandler>,
    on_open_change: Option<OpenHandler>,
}

impl PlopMultiSelect {
    #[allow(clippy::too_many_arguments)]
    pub fn new(
        id: impl Into<ElementId>,
        label: impl Into<SharedString>,
        options: Vec<SharedString>,
        selected: Vec<bool>,
        open: bool,
        focus: FocusHandle,
        option_focuses: Vec<FocusHandle>,
        theme: PlopTheme,
    ) -> Self {
        Self {
            id: id.into(),
            label: label.into(),
            options,
            selected,
            open,
            focus,
            option_focuses,
            theme,
            on_toggle: None,
            on_open_change: None,
        }
    }

    pub fn on_toggle(mut self, handler: impl Fn(usize, &mut Window, &mut App) + 'static) -> Self {
        self.on_toggle = Some(Rc::new(handler));
        self
    }

    pub fn on_open_change(
        mut self,
        handler: impl Fn(bool, &mut Window, &mut App) + 'static,
    ) -> Self {
        self.on_open_change = Some(Rc::new(handler));
        self
    }
}

impl RenderOnce for PlopMultiSelect {
    fn render(self, window: &mut Window, _cx: &mut App) -> impl IntoElement {
        let focused = self.focus.is_focused(window);
        let focus_color = self.theme.mode().focus;
        let open = self.open;
        let count = self.selected.iter().filter(|value| **value).count();
        let summary = if count == 0 {
            "Select…".to_string()
        } else {
            format!("{count} selected")
        };
        let seed = self.label.clone();
        let field_seed = format!("multi-{seed}");
        let trigger = div()
            .id(self.id)
            .role(Role::ComboBox)
            .aria_label(self.label.clone())
            .aria_expanded(open)
            .track_focus(&self.focus)
            .tab_stop(true)
            .relative()
            .h(px(54.0))
            .w_full()
            .flex()
            .items_center()
            .justify_between()
            .px(px(18.0))
            .cursor_pointer()
            .child(
                canvas(
                    move |bounds, _, _| bounds,
                    move |bounds, _, window, _| {
                        paint::paint_field(window, bounds, &field_seed, focus_color, focused, false)
                    },
                )
                .absolute()
                .inset_0(),
            )
            .child(
                div()
                    .relative()
                    .font_family(FONT)
                    .text_size(px(19.0))
                    .text_color(to_hsla(theme::color::INK_TEXT))
                    .child(summary),
            )
            .child(meta_text(if open { "▴" } else { "▾" }, theme::color::INK));
        let trigger = trigger
            .on_mouse_up(MouseButton::Left, {
                let on_open = self.on_open_change.clone();
                move |_, window, cx| {
                    if let Some(handler) = on_open.clone() {
                        handler(!open, window, cx);
                    }
                }
            })
            .on_key_down({
                let on_open = self.on_open_change.clone();
                let first = self.option_focuses.first().cloned();
                move |event, window, cx| {
                    let key = event.keystroke.key.as_str();
                    if matches!(key, "enter" | "space" | "down") && !open {
                        if let Some(handler) = on_open.clone() {
                            handler(true, window, cx);
                        }
                        if let Some(focus) = first.clone() {
                            window.focus(&focus, cx);
                        }
                        cx.stop_propagation();
                    } else if key == "escape" && open {
                        if let Some(handler) = on_open.clone() {
                            handler(false, window, cx);
                        }
                        cx.stop_propagation();
                    }
                }
            });
        let mut root = div()
            .relative()
            .w_full()
            .flex()
            .flex_col()
            .gap(px(8.0))
            .child(meta_text(self.label.clone(), self.theme.mode().on_soft))
            .child(trigger);
        if open {
            let mut list = div()
                .relative()
                .flex()
                .flex_col()
                .gap(px(4.0))
                .p(px(12.0))
                .child(
                    canvas(
                        |bounds, _, _| bounds,
                        move |bounds, _, window, _| {
                            paint::paint_paper_card(
                                window,
                                bounds,
                                "multi-popup",
                                PlopTheme::default().mode(),
                                false,
                            )
                        },
                    )
                    .absolute()
                    .inset_0(),
                );
            for (index, option) in self.options.into_iter().enumerate() {
                let checked = self.selected.get(index).copied().unwrap_or(false);
                let on_toggle = self.on_toggle.clone();
                let focus = self.option_focuses.get(index).cloned();
                let mut row = div()
                    .id(ElementId::Name(format!("multi-option-{index}").into()))
                    .role(Role::ListBoxOption)
                    .aria_selected(checked)
                    .relative()
                    .flex()
                    .items_center()
                    .gap(px(10.0))
                    .px(px(8.0))
                    .py(px(6.0))
                    .cursor_pointer()
                    .child(
                        div().relative().size(px(22.0)).child(
                            canvas(
                                |bounds, _, _| bounds,
                                move |bounds, _, window, _| {
                                    paint::paint_checkbox(
                                        window,
                                        bounds,
                                        checked,
                                        theme::color::INK,
                                        false,
                                        "multi-check",
                                    )
                                },
                            )
                            .absolute()
                            .inset_0(),
                        ),
                    )
                    .child(body_text(option, 18.0, theme::color::INK_TEXT));
                if let Some(focus) = focus {
                    row = row.track_focus(&focus).tab_stop(true).on_key_down({
                        let on_toggle = on_toggle.clone();
                        move |event, window, cx| {
                            if matches!(event.keystroke.key.as_str(), "space" | "enter") {
                                if let Some(handler) = on_toggle.clone() {
                                    handler(index, window, cx);
                                }
                                cx.stop_propagation();
                            }
                        }
                    });
                }
                row = row.on_click(move |_, window, cx| {
                    if let Some(handler) = on_toggle.clone() {
                        handler(index, window, cx);
                    }
                });
                list = list.child(row);
            }
            root = root.child(
                div()
                    .absolute()
                    .top(px(82.0))
                    .left_0()
                    .right_0()
                    .child(list),
            );
        }
        root
    }
}

/// A controlled menu. The trigger is a sticker button; items own focus so Tab
/// reaches them and Enter/Space runs them.
#[derive(IntoElement)]
pub struct PlopMenu {
    id: ElementId,
    label: SharedString,
    open: bool,
    trigger_focus: FocusHandle,
    item_focuses: Vec<FocusHandle>,
    theme: PlopTheme,
    on_open_change: Option<OpenHandler>,
    items: Vec<MenuItem>,
}

impl PlopMenu {
    pub fn new(
        id: impl Into<ElementId>,
        label: impl Into<SharedString>,
        open: bool,
        trigger_focus: FocusHandle,
        item_focuses: Vec<FocusHandle>,
        theme: PlopTheme,
    ) -> Self {
        Self {
            id: id.into(),
            label: label.into(),
            open,
            trigger_focus,
            item_focuses,
            theme,
            on_open_change: None,
            items: Vec::new(),
        }
    }

    pub fn item(
        mut self,
        label: impl Into<SharedString>,
        action: impl Fn(&mut Window, &mut App) + 'static,
    ) -> Self {
        self.items.push((label.into(), Rc::new(action)));
        self
    }

    pub fn on_open_change(
        mut self,
        handler: impl Fn(bool, &mut Window, &mut App) + 'static,
    ) -> Self {
        self.on_open_change = Some(Rc::new(handler));
        self
    }
}

impl RenderOnce for PlopMenu {
    fn render(self, _window: &mut Window, _cx: &mut App) -> impl IntoElement {
        let open = self.open;
        let trigger = PlopButton::new(
            self.id.clone(),
            self.label.clone(),
            self.theme,
            self.trigger_focus.clone(),
        )
        .fill(if open { Fill::Mustard } else { Fill::Plain })
        .on_click({
            let on_open = self.on_open_change.clone();
            let focus = self.trigger_focus.clone();
            move |_, window, cx| {
                if let Some(handler) = on_open.clone() {
                    handler(!open, window, cx);
                }
                window.focus(&focus, cx);
            }
        });
        let mut root = div()
            .relative()
            .flex()
            .flex_col()
            .items_start()
            .child(trigger);
        if open {
            let mut list = div()
                .relative()
                .flex()
                .flex_col()
                .items_stretch()
                .gap(px(2.0))
                .p(px(10.0))
                .min_w(px(220.0))
                .child(
                    canvas(
                        |bounds, _, _| bounds,
                        move |bounds, _, window, _| {
                            paint::paint_paper_card(
                                window,
                                bounds,
                                "menu-popup",
                                PlopTheme::default().mode(),
                                false,
                            )
                        },
                    )
                    .absolute()
                    .inset_0(),
                );
            for (index, (label, action)) in self.items.iter().enumerate() {
                let action = action.clone();
                let on_open = self.on_open_change.clone();
                let trigger_focus = self.trigger_focus.clone();
                let mut row = div()
                    .id(ElementId::Name(format!("menu-item-{index}").into()))
                    .role(Role::MenuListOption)
                    .relative()
                    .px(px(12.0))
                    .py(px(8.0))
                    .cursor_pointer()
                    .font_family(FONT)
                    .text_size(px(18.0))
                    .text_color(to_hsla(theme::color::INK_TEXT))
                    .child(label.clone());
                if let Some(focus) = self.item_focuses.get(index) {
                    row = row.track_focus(focus).tab_stop(true).on_key_down({
                        let action = action.clone();
                        let on_open = on_open.clone();
                        let trigger_focus = trigger_focus.clone();
                        move |event, window, cx| {
                            let key = event.keystroke.key.as_str();
                            if matches!(key, "enter" | "space") {
                                action(window, cx);
                                if let Some(handler) = on_open.clone() {
                                    handler(false, window, cx);
                                }
                                window.focus(&trigger_focus, cx);
                                cx.stop_propagation();
                            } else if key == "escape" {
                                if let Some(handler) = on_open.clone() {
                                    handler(false, window, cx);
                                }
                                window.focus(&trigger_focus, cx);
                                cx.stop_propagation();
                            }
                        }
                    });
                }
                row = row.on_click({
                    let action = action.clone();
                    let on_open = on_open.clone();
                    let trigger_focus = trigger_focus.clone();
                    move |_, window, cx| {
                        action(window, cx);
                        if let Some(handler) = on_open.clone() {
                            handler(false, window, cx);
                        }
                        window.focus(&trigger_focus, cx);
                    }
                });
                list = list.child(row);
            }
            root = root.child(div().absolute().top(px(60.0)).left_0().child(list));
        }
        root
    }
}

/// A styled search input: the base input keeps editing, PlopUI draws the
/// magnifier and the paper.
#[derive(IntoElement)]
pub struct PlopSearchField {
    state: Entity<base::input::InputState>,
    seed: SharedString,
    theme: PlopTheme,
}

impl PlopSearchField {
    pub fn new(
        state: Entity<base::input::InputState>,
        placeholder: impl Into<SharedString>,
        theme: PlopTheme,
    ) -> Self {
        let placeholder = placeholder.into();
        Self {
            state,
            seed: placeholder,
            theme,
        }
    }
}

impl RenderOnce for PlopSearchField {
    fn render(self, window: &mut Window, cx: &mut App) -> impl IntoElement {
        let focus = self.state.read(cx).focus_handle(cx);
        let focused = focus.is_focused(window);
        let seed = self.seed;
        let focus_color = self.theme.mode().focus;
        div()
            .relative()
            .h(px(54.0))
            .w_full()
            .child(
                canvas(
                    move |bounds, _, _| bounds,
                    move |bounds, _, window, _| {
                        paint::paint_field(window, bounds, &seed, focus_color, focused, false)
                    },
                )
                .absolute()
                .inset_0(),
            )
            .child(
                div()
                    .absolute()
                    .left(px(16.0))
                    .top(px(16.0))
                    .size(px(22.0))
                    .child(
                        canvas(
                            |bounds, _, _| bounds,
                            move |bounds, _, window, _| {
                                paint::paint_doodle(
                                    window,
                                    bounds,
                                    DoodleKind::Sparkle,
                                    theme::color::INK,
                                )
                            },
                        )
                        .absolute()
                        .inset_0(),
                    ),
            )
            .child(
                div()
                    .absolute()
                    .inset_0()
                    .pl(px(50.0))
                    .pr(px(16.0))
                    .flex()
                    .items_center()
                    .font_family(FONT)
                    .text_size(px(19.0))
                    .text_color(to_hsla(theme::color::INK_TEXT))
                    .child(base::Input::new(&self.state)),
            )
    }
}

/// A tooltip card. Use it inside GPUI's native `.tooltip(...)` builder:
/// `.tooltip(plop_tooltip("Saves the ticket", theme))`.
#[derive(IntoElement)]
pub struct PlopTooltip {
    text: SharedString,
}

impl PlopTooltip {
    pub fn new(text: impl Into<SharedString>, _theme: PlopTheme) -> Self {
        Self { text: text.into() }
    }
}

impl RenderOnce for PlopTooltip {
    fn render(self, _window: &mut Window, _cx: &mut App) -> impl IntoElement {
        div()
            .relative()
            .px(px(14.0))
            .py(px(8.0))
            .max_w(px(280.0))
            .child(
                canvas(
                    |bounds, _, _| bounds,
                    move |bounds, _, window, _| {
                        paint::paint_callout(window, bounds, "tooltip", Fill::Mustard)
                    },
                )
                .absolute()
                .inset_0(),
            )
            .child(
                div()
                    .relative()
                    .font_family(FONT)
                    .text_size(px(15.0))
                    .text_color(to_hsla(Fill::Mustard.on_fill()))
                    .child(self.text),
            )
    }
}

struct PlopTooltipView {
    text: SharedString,
    theme: PlopTheme,
}

impl Render for PlopTooltipView {
    fn render(&mut self, _window: &mut Window, _cx: &mut Context<Self>) -> impl IntoElement {
        PlopTooltip::new(self.text.clone(), self.theme)
    }
}

/// Builds the closure GPUI's `.tooltip(...)` expects.
pub fn plop_tooltip(
    text: impl Into<SharedString>,
    theme: PlopTheme,
) -> impl Fn(&mut Window, &mut App) -> AnyView + 'static {
    let text = text.into();
    move |_, cx| {
        cx.new(|_| PlopTooltipView {
            text: text.clone(),
            theme,
        })
        .into()
    }
}

/// A stack of toasts, anchored by the caller. The app owns the queue; this
/// component owns the paper and the layout.
#[derive(IntoElement)]
pub struct PlopToaster {
    toasts: Vec<(SharedString, CalloutTone)>,
}

impl PlopToaster {
    pub fn new() -> Self {
        Self { toasts: Vec::new() }
    }

    pub fn toast(mut self, message: impl Into<SharedString>, tone: CalloutTone) -> Self {
        self.toasts.push((message.into(), tone));
        self
    }
}

impl Default for PlopToaster {
    fn default() -> Self {
        Self::new()
    }
}

impl RenderOnce for PlopToaster {
    fn render(self, _window: &mut Window, _cx: &mut App) -> impl IntoElement {
        div().flex().flex_col().items_end().gap(px(10.0)).children(
            self.toasts
                .into_iter()
                .map(|(message, tone)| PlopToast::new(message, tone)),
        )
    }
}

/// The three kinds of toast the kit shows.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum ToastTone {
    Info,
    Success,
    Error,
}

impl ToastTone {
    pub fn label(self) -> &'static str {
        match self {
            Self::Info => "info",
            Self::Success => "success",
            Self::Error => "error",
        }
    }

    fn callout(self) -> CalloutTone {
        match self {
            Self::Info => CalloutTone::Info,
            Self::Success => CalloutTone::Success,
            Self::Error => CalloutTone::Error,
        }
    }
}

/// One message in the queue.
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct ToastEntry {
    pub id: u64,
    pub message: SharedString,
    pub tone: ToastTone,
}

/// A one-at-a-time toast queue, like the browser kit: a new toast replaces the
/// last, and it leaves after `duration` unless something dismisses it first.
pub struct ToastQueue {
    current: Option<ToastEntry>,
    next_id: u64,
    duration: std::time::Duration,
}

impl ToastQueue {
    pub fn new() -> Self {
        Self {
            current: None,
            next_id: 1,
            duration: std::time::Duration::from_millis(4000),
        }
    }

    /// How long a toast stays up. Default 4000 ms, long enough to read twice.
    pub fn duration(mut self, duration: std::time::Duration) -> Self {
        self.duration = duration;
        self
    }

    pub fn current(&self) -> Option<&ToastEntry> {
        self.current.as_ref()
    }

    /// Show a toast and return its id. The oldest task checks the id before
    /// dismissing, so a replacement is not removed by the previous timer.
    pub fn show(
        &mut self,
        tone: ToastTone,
        message: impl Into<SharedString>,
        cx: &mut Context<Self>,
    ) -> u64 {
        let duration = self.duration;
        self.show_for(tone, message, duration, cx)
    }

    pub fn show_for(
        &mut self,
        tone: ToastTone,
        message: impl Into<SharedString>,
        duration: std::time::Duration,
        cx: &mut Context<Self>,
    ) -> u64 {
        let id = self.next_id;
        self.next_id += 1;
        self.current = Some(ToastEntry {
            id,
            message: message.into(),
            tone,
        });
        cx.notify();
        cx.spawn(async move |this, cx| {
            cx.background_executor().timer(duration).await;
            let _ = this.update(cx, |this, cx| {
                if this.current.as_ref().is_some_and(|entry| entry.id == id) {
                    this.current = None;
                    cx.notify();
                }
            });
        })
        .detach();
        id
    }

    pub fn dismiss(&mut self, id: u64, cx: &mut Context<Self>) {
        if self.current.as_ref().is_some_and(|entry| entry.id == id) {
            self.current = None;
            cx.notify();
        }
    }

    pub fn clear(&mut self, cx: &mut Context<Self>) {
        if self.current.take().is_some() {
            cx.notify();
        }
    }
}

impl Default for ToastQueue {
    fn default() -> Self {
        Self::new()
    }
}

struct ToastGlobal(Entity<ToastQueue>);

impl gpui_kit::Global for ToastGlobal {}

/// Create the app-wide queue once, then call [`show_toast`] from anywhere that
/// has an `App`.
pub fn init_toasts(cx: &mut App) -> Entity<ToastQueue> {
    let queue = cx.new(|_| ToastQueue::new());
    cx.set_global(ToastGlobal(queue.clone()));
    queue
}

/// Push a toast through the app-wide queue. Returns `None` before
/// [`init_toasts`] has run.
pub fn show_toast(cx: &mut App, tone: ToastTone, message: impl Into<SharedString>) -> Option<u64> {
    let queue = cx.try_global::<ToastGlobal>()?.0.clone();
    let mut id = None;
    queue.update(cx, |queue, cx| {
        id = Some(queue.show(tone, message, cx));
    });
    id
}

pub fn dismiss_toast(cx: &mut App, id: u64) {
    if let Some(global) = cx.try_global::<ToastGlobal>() {
        let queue = global.0.clone();
        queue.update(cx, |queue, cx| queue.dismiss(id, cx));
    }
}

/// The live toast zone: a polite status at the bottom of the window. Click the
/// toast to dismiss it. Embed the entity returned by `cx.new`.
pub struct PlopToastHost {
    queue: Entity<ToastQueue>,
    observed: bool,
}

impl PlopToastHost {
    pub fn new(queue: Entity<ToastQueue>) -> Self {
        Self {
            queue,
            observed: false,
        }
    }
}

impl Render for PlopToastHost {
    fn render(&mut self, _window: &mut Window, cx: &mut Context<Self>) -> impl IntoElement {
        if !self.observed {
            cx.observe(&self.queue, |_, _, cx| cx.notify()).detach();
            self.observed = true;
        }
        let entry = self.queue.read(cx).current().cloned();
        div()
            .absolute()
            .left_0()
            .right_0()
            .bottom(px(24.0))
            .flex()
            .justify_center()
            .when_some(entry, |host, entry| {
                let queue = self.queue.clone();
                let id = entry.id;
                host.child(
                    div()
                        .id("plop-live-toast")
                        .role(Role::Status)
                        .aria_label(entry.message.clone())
                        .cursor_pointer()
                        .on_mouse_up(MouseButton::Left, move |_, _, cx| {
                            queue.update(cx, |queue, cx| queue.dismiss(id, cx));
                        })
                        .child(PlopToast::new(entry.message, entry.tone.callout())),
                )
            })
    }
}

/// A command palette overlay. Filtering and selection are owned by the app;
/// the component owns the modal paper, the query input and key handling.
#[derive(IntoElement)]
pub struct PlopCommandPalette {
    open: bool,
    query: Entity<base::input::InputState>,
    results: Vec<SharedString>,
    selected: usize,
    theme: PlopTheme,
    on_move: Option<ItemHandler>,
    on_confirm: Option<ItemHandler>,
    on_close: Option<ActionHandler>,
}

impl PlopCommandPalette {
    pub fn new(
        open: bool,
        query: Entity<base::input::InputState>,
        results: Vec<SharedString>,
        selected: usize,
        theme: PlopTheme,
    ) -> Self {
        Self {
            open,
            query,
            results,
            selected,
            theme,
            on_move: None,
            on_confirm: None,
            on_close: None,
        }
    }

    pub fn on_move(mut self, handler: impl Fn(usize, &mut Window, &mut App) + 'static) -> Self {
        self.on_move = Some(Rc::new(handler));
        self
    }

    pub fn on_confirm(mut self, handler: impl Fn(usize, &mut Window, &mut App) + 'static) -> Self {
        self.on_confirm = Some(Rc::new(handler));
        self
    }

    pub fn on_close(mut self, handler: impl Fn(&mut Window, &mut App) + 'static) -> Self {
        self.on_close = Some(Rc::new(handler));
        self
    }
}

impl RenderOnce for PlopCommandPalette {
    fn render(self, window: &mut Window, cx: &mut App) -> impl IntoElement {
        if !self.open {
            return div().into_any_element();
        }
        let selected = self.selected.min(self.results.len().saturating_sub(1));
        let count = self.results.len();
        let on_move = self.on_move.clone();
        let on_confirm = self.on_confirm.clone();
        let on_close = self.on_close.clone();
        let focus = self.query.read(cx).focus_handle(cx);
        let focused = focus.is_focused(window);
        let seed = "command-palette";
        let mut list = div().flex().flex_col().gap(px(2.0));
        for (index, result) in self.results.clone().into_iter().enumerate() {
            let is_selected = index == selected;
            let confirm = self.on_confirm.clone();
            list = list.child(
                div()
                    .id(ElementId::Name(format!("command-{index}").into()))
                    .role(Role::ListBoxOption)
                    .aria_selected(is_selected)
                    .relative()
                    .px(px(14.0))
                    .py(px(9.0))
                    .cursor_pointer()
                    .font_family(FONT)
                    .text_size(px(18.0))
                    .text_color(to_hsla(if is_selected {
                        theme::color::INK
                    } else {
                        theme::color::INK_SOFT
                    }))
                    .when(is_selected, |row| {
                        row.child(
                            canvas(
                                |bounds, _, _| bounds,
                                move |bounds, _, window, _| {
                                    paint::paint_underline(window, bounds, theme::color::MUSTARD)
                                },
                            )
                            .absolute()
                            .inset_0(),
                        )
                    })
                    .child(result)
                    .on_click(move |_, window, cx| {
                        if let Some(handler) = confirm.clone() {
                            handler(index, window, cx);
                        }
                    }),
            );
        }
        let query_focus = focus.clone();
        div()
            .id("command-palette-backdrop")
            .absolute()
            .inset_0()
            .bg(alpha_hsla(plopui_core::theme::Rgba::from_rgb(
                theme::color::INK,
                0.42,
            )))
            .capture_key_down(
                move |event, window, cx| match event.keystroke.key.as_str() {
                    "down" => {
                        if let Some(handler) = on_move.clone() {
                            handler((selected + 1) % count.max(1), window, cx);
                        }
                        cx.stop_propagation();
                    }
                    "up" => {
                        if let Some(handler) = on_move.clone() {
                            let next = if selected == 0 {
                                count.saturating_sub(1)
                            } else {
                                selected - 1
                            };
                            handler(next, window, cx);
                        }
                        cx.stop_propagation();
                    }
                    "enter" => {
                        if let Some(handler) = on_confirm.clone() {
                            handler(selected, window, cx);
                        }
                        cx.stop_propagation();
                    }
                    "escape" => {
                        if let Some(handler) = on_close.clone() {
                            handler(window, cx);
                        }
                        cx.stop_propagation();
                    }
                    _ => {}
                },
            )
            .child(
                div()
                    .absolute()
                    .top(px(96.0))
                    .left_0()
                    .right_0()
                    .flex()
                    .justify_center()
                    .child(
                        div()
                            .relative()
                            .w(px(620.0))
                            .p(px(18.0))
                            .flex()
                            .flex_col()
                            .gap(px(10.0))
                            .child(
                                canvas(
                                    |bounds, _, _| bounds,
                                    move |bounds, _, window, _| {
                                        paint::paint_paper_card(
                                            window,
                                            bounds,
                                            seed,
                                            self.theme.mode(),
                                            false,
                                        )
                                    },
                                )
                                .absolute()
                                .inset_0(),
                            )
                            .child(
                                div()
                                    .relative()
                                    .h(px(52.0))
                                    .w_full()
                                    .px(px(14.0))
                                    .flex()
                                    .items_center()
                                    .text_color(to_hsla(theme::color::INK_TEXT))
                                    .child(base::Input::new(&self.query)),
                            )
                            .child(
                                div().relative().h(px(2.0)).w_full().child(
                                    canvas(
                                        |bounds, _, _| bounds,
                                        move |bounds, _, window, _| {
                                            paint::paint_perforation(window, bounds, "command-perf")
                                        },
                                    )
                                    .absolute()
                                    .inset_0(),
                                ),
                            )
                            .child(div().relative().child(list))
                            .when(self.results.is_empty(), |card| {
                                card.child(meta_text("NO MATCHES", theme::color::INK_SOFT))
                            }),
                    ),
            )
            .when(!focused, |backdrop| {
                backdrop.on_mouse_down(MouseButton::Left, move |_, window, cx| {
                    window.focus(&query_focus, cx);
                })
            })
            .into_any_element()
    }
}
