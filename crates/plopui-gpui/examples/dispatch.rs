//! The dispatch queue from `apps/dispatch-demo`, rebuilt as a real GPUI app.
//!
//! Run with: cargo run -p plopui-gpui --example dispatch
//! Capture with: PLOP_CAPTURE_OUT=/tmp/dispatch.png cargo run -p plopui-gpui --example dispatch

use std::borrow::Cow;
use std::time::Duration;

use gpui_kit::base::input::InputState;
use gpui_kit::platform::{current_headless_renderer, current_platform};
use gpui_kit::prelude::FluentBuilder as _;
use gpui_kit::*;
use plopui_core::theme::{Fill, Status, SurfaceName, XS};
use plopui_gpui::{
    FONT, PlopButton, PlopCard, PlopCount, PlopDivider, PlopEmptyState, PlopHeading,
    PlopSearchField, PlopSheet, PlopStatus, PlopStatusTimeline, PlopTabs, PlopTag, PlopTextField,
    PlopTheme, PlopTicketCard, PlopToastHost, PlopUnitCard, ToastQueue, ToastTone, color::to_hsla,
    meta_text,
};

/// Every ticket walks the same five stages.
const STAGES: [&str; 5] = ["REPORTED", "DISPATCHED", "EN ROUTE", "ON SCENE", "RESOLVED"];

const UNITS: [(&str, &str); 3] = [
    ("BIX-1", "TESS · RIVER CREW"),
    ("PIP-2", "MAYA · NIGHT CREW"),
    ("TESS-7", "JUN · DAY CREW"),
];

struct Ticket {
    id: u32,
    kind: SharedString,
    place: SharedString,
    critical: bool,
    stage: usize,
    unit: Option<SharedString>,
}

impl Ticket {
    fn is_open(&self) -> bool {
        self.stage < STAGES.len() - 1
    }
}

fn stage_status(stage: usize) -> Status {
    match stage {
        0 => Status::Unassigned,
        1 => Status::Dispatched,
        2 | 3 => Status::EnRoute,
        _ => Status::Resolved,
    }
}

fn action_label(stage: usize) -> &'static str {
    match stage {
        0 => "DISPATCH UNIT",
        1 => "MARK EN ROUTE",
        2 => "MARK ON SCENE",
        3 => "RESOLVE TICKET",
        _ => "RESOLVED",
    }
}

pub struct Dispatch {
    surface: SurfaceName,
    dark: bool,
    tab: usize,
    tickets: Vec<Ticket>,
    selected: u32,
    next_id: u32,
    resolving: Option<u32>,
    kind: Entity<InputState>,
    search: Entity<InputState>,
    toasts: Entity<ToastQueue>,
    toast_host: Entity<PlopToastHost>,
    ink_host: Entity<plopui_gpui::PlopInkBurstHost>,
    focus_tabs: [FocusHandle; 2],
    focus_tickets: [FocusHandle; 16],
    focus_advance: FocusHandle,
    focus_night: FocusHandle,
    focus_send: FocusHandle,
    focus_empty: FocusHandle,
}

impl Dispatch {
    pub fn new(window: &mut Window, cx: &mut Context<Self>) -> Self {
        let kind = cx.new(|cx| {
            InputState::new(window, cx)
                .placeholder("Fallen tree on the corner")
                .default_value("")
        });
        // `PLOP_DISPATCH_QUERY` opens the queue already filtered; it is how the
        // empty state gets captured, and it is handy for demos.
        let query = std::env::var("PLOP_DISPATCH_QUERY").unwrap_or_default();
        let search = cx.new(|cx| {
            InputState::new(window, cx)
                .placeholder("Search tickets")
                .default_value(query)
        });
        // The queue is filtered during render, so every keystroke has to
        // re-render the page, not just the field.
        cx.observe(&search, |_, _, cx| cx.notify()).detach();
        let toasts = cx.new(|_| ToastQueue::new());
        let toast_host = cx.new(|_| PlopToastHost::new(toasts.clone()));
        let ink_host = plopui_gpui::install_ink_bursts(cx);
        let surface = match std::env::var("PLOP_SURFACE")
            .unwrap_or_default()
            .to_ascii_lowercase()
            .as_str()
        {
            "mat" | "cutting-mat" => SurfaceName::Mat,
            "notebook" => SurfaceName::Notebook,
            "kraft" => SurfaceName::Kraft,
            "riso" => SurfaceName::Riso,
            _ => SurfaceName::Poster,
        };
        let dark = matches!(
            std::env::var("PLOP_DARK").unwrap_or_default().as_str(),
            "1" | "true"
        );
        Self {
            surface,
            dark,
            tab: 0,
            tickets: vec![
                Ticket {
                    id: 4812,
                    kind: "FLOODING ON MAIN ROAD".into(),
                    place: "MAIN ROAD".into(),
                    critical: true,
                    stage: 2,
                    unit: Some("BIX-1".into()),
                },
                Ticket {
                    id: 4813,
                    kind: "DOWNED POWER LINE".into(),
                    place: "RIVERSIDE".into(),
                    critical: false,
                    stage: 1,
                    unit: Some("PIP-2".into()),
                },
                Ticket {
                    id: 4810,
                    kind: "LOST DOG, VERY DRAMATIC".into(),
                    place: "MARKET".into(),
                    critical: false,
                    stage: 0,
                    unit: None,
                },
                Ticket {
                    id: 4805,
                    kind: "TREE ON A TRICYCLE".into(),
                    place: "CORNER 4".into(),
                    critical: false,
                    stage: 4,
                    unit: Some("TESS-7".into()),
                },
            ],
            selected: 4812,
            next_id: 4814,
            resolving: None,
            kind,
            search,
            toasts,
            toast_host,
            ink_host,
            focus_tabs: std::array::from_fn(|_| cx.focus_handle()),
            focus_tickets: std::array::from_fn(|_| cx.focus_handle()),
            focus_advance: cx.focus_handle(),
            focus_night: cx.focus_handle(),
            focus_send: cx.focus_handle(),
            focus_empty: cx.focus_handle(),
        }
    }

    fn select(&mut self, id: u32, cx: &mut Context<Self>) {
        self.selected = id;
        cx.notify();
    }

    /// Moves the selected ticket one stage on. The last step is async on
    /// purpose: it is the demo's loading-button case.
    fn advance(&mut self, cx: &mut Context<Self>) {
        if self.resolving.is_some() {
            return;
        }
        let mut message = None;
        let mut resolve = None;
        if let Some(ticket) = self.tickets.iter_mut().find(|t| t.id == self.selected) {
            match ticket.stage {
                0 => {
                    ticket.stage = 1;
                    ticket.unit = Some("PIP-2".into());
                    message = Some((
                        format!("UNIT PIP-2 DISPATCHED · #{}", ticket.id),
                        ToastTone::Info,
                    ));
                }
                1 => {
                    ticket.stage = 2;
                    message = Some((format!("TICKET #{} EN ROUTE", ticket.id), ToastTone::Info));
                }
                2 => {
                    ticket.stage = 3;
                    message = Some((format!("TICKET #{} ON SCENE", ticket.id), ToastTone::Info));
                }
                3 => {
                    self.resolving = Some(ticket.id);
                    resolve = Some(ticket.id);
                }
                _ => {}
            }
        }
        if let Some((text, tone)) = message {
            self.toasts.update(cx, |queue, cx| {
                queue.show_for(tone, text, Duration::from_secs(4), cx);
            });
        }
        if let Some(id) = resolve {
            let toasts = self.toasts.clone();
            cx.spawn(async move |this, cx| {
                cx.background_executor()
                    .timer(Duration::from_millis(900))
                    .await;
                let _ = this.update(cx, |this, cx| {
                    if let Some(ticket) = this.tickets.iter_mut().find(|t| t.id == id) {
                        ticket.stage = 4;
                    }
                    this.resolving = None;
                    toasts.update(cx, |queue, cx| {
                        queue.show_for(
                            ToastTone::Success,
                            format!("TICKET #{id} RESOLVED"),
                            Duration::from_secs(6),
                            cx,
                        );
                    });
                    cx.notify();
                });
            })
            .detach();
        }
        cx.notify();
    }

    fn file_report(&mut self, window: &mut Window, cx: &mut Context<Self>) {
        let kind = self.kind.read(cx).value().trim().to_string();
        if kind.len() < 3 {
            return;
        }
        let id = self.next_id;
        self.next_id += 1;
        self.tickets.push(Ticket {
            id,
            kind: kind.to_uppercase().into(),
            place: "MAIN ROAD".into(),
            critical: false,
            stage: 0,
            unit: None,
        });
        self.selected = id;
        self.tab = 0;
        self.kind
            .update(cx, |state, cx| state.set_value("", window, cx));
        self.toasts.update(cx, |queue, cx| {
            queue.show_for(
                ToastTone::Success,
                format!("REPORT #{id} FILED"),
                Duration::from_secs(6),
                cx,
            );
        });
        cx.notify();
    }
}

impl Render for Dispatch {
    fn render(&mut self, _window: &mut Window, cx: &mut Context<Self>) -> impl IntoElement {
        let theme = PlopTheme {
            surface: self.surface,
            dark: self.dark,
        };
        let mode = theme.mode();
        // Ink on cream: the page text follows the surface, paper text does not.
        let paper = theme.on_paper();
        let ink_soft = plopui_core::theme::color::INK_SOFT;
        let weak = cx.entity().downgrade();
        let on = to_hsla(mode.on);
        let soft = to_hsla(mode.on_soft);

        let select_ticket = |id: u32| {
            let weak = weak.clone();
            move |_: &ClickEvent, _: &mut Window, cx: &mut App| {
                let _ = weak.update(cx, |this, cx| this.select(id, cx));
            }
        };
        let set_tab = {
            let weak = weak.clone();
            move |index: usize, _: &mut Window, cx: &mut App| {
                let _ = weak.update(cx, |this, cx| {
                    this.tab = index;
                    cx.notify();
                });
            }
        };
        // The empty state has one button whose job depends on why the list is
        // empty: drop the query, or look at the other tab.
        let empty_action = {
            let weak = weak.clone();
            move |_: &ClickEvent, window: &mut Window, cx: &mut App| {
                let _ = weak.update(cx, |this, cx| {
                    let searching = !this.search.read(cx).value().trim().is_empty();
                    if searching {
                        this.search
                            .update(cx, |state, cx| state.set_value("", window, cx));
                    } else {
                        this.tab = 1 - this.tab;
                    }
                    cx.notify();
                });
            }
        };
        let advance = {
            let weak = weak.clone();
            move |_: &ClickEvent, _: &mut Window, cx: &mut App| {
                let _ = weak.update(cx, |this, cx| this.advance(cx));
            }
        };
        let send = {
            let weak = weak.clone();
            move |_: &ClickEvent, window: &mut Window, cx: &mut App| {
                let _ = weak.update(cx, |this, cx| this.file_report(window, cx));
            }
        };
        let toggle_night = {
            let weak = weak.clone();
            move |_: &ClickEvent, _: &mut Window, cx: &mut App| {
                let _ = weak.update(cx, |this, cx| {
                    this.dark = !this.dark;
                    cx.notify();
                });
            }
        };

        let open: Vec<&Ticket> = self.tickets.iter().filter(|t| t.is_open()).collect();
        let resolved: Vec<&Ticket> = self.tickets.iter().filter(|t| !t.is_open()).collect();
        let critical = open.iter().filter(|t| t.critical).count();
        let query = self.search.read(cx).value().trim().to_lowercase();
        let base: Vec<&Ticket> = if self.tab == 0 {
            open.clone()
        } else {
            resolved
        };
        let visible: Vec<&Ticket> = base
            .into_iter()
            .filter(|ticket| {
                query.is_empty()
                    || ticket.kind.to_lowercase().contains(query.as_str())
                    || ticket.place.to_lowercase().contains(query.as_str())
                    || ticket
                        .unit
                        .as_ref()
                        .is_some_and(|unit| unit.to_lowercase().contains(query.as_str()))
            })
            .collect();
        let current = self.tickets.iter().find(|t| t.id == self.selected);

        let mut queue = div()
            .id("queue-scroll")
            .flex()
            .flex_col()
            .gap(px(14.0))
            .flex_1()
            .overflow_y_scroll();
        if visible.is_empty() {
            let searching = !query.is_empty();
            let mut empty =
                PlopEmptyState::new(if searching { "NO MATCHES" } else { "ALL QUIET" }, theme)
                    .body(if searching {
                        "Try another word, or clear the search."
                    } else if self.tab == 0 {
                        "Nothing open. The kettle is on."
                    } else {
                        "Nothing resolved yet. Give it a minute."
                    });
            let action_label = if searching {
                "CLEAR SEARCH"
            } else if self.tab == 0 {
                "SHOW RESOLVED"
            } else {
                "SHOW OPEN"
            };
            empty = empty.action(
                PlopButton::new(
                    "clear-filter",
                    action_label,
                    theme,
                    self.focus_empty.clone(),
                )
                .small()
                .fill(Fill::Plain)
                .on_click(empty_action.clone()),
            );
            queue = queue.child(empty);
        } else {
            for (index, ticket) in visible.iter().enumerate() {
                let is_selected = ticket.id == self.selected;
                let focus = self.focus_tickets[index % self.focus_tickets.len()].clone();
                let card = PlopTicketCard::new(
                    format!("ticket-{}", ticket.id),
                    ticket.kind.clone(),
                    theme,
                )
                .code(format!(
                    "TICKET #{} · {}",
                    ticket.id,
                    if ticket.critical {
                        "CRITICAL"
                    } else {
                        "ROUTINE"
                    }
                ))
                .status(stage_status(ticket.stage))
                .child(
                    div()
                        .flex()
                        .items_center()
                        .gap(px(10.0))
                        .child(meta_text(
                            match &ticket.unit {
                                Some(unit) => format!("{} · {}", ticket.place, unit),
                                None => ticket.place.to_string(),
                            },
                            ink_soft,
                        ))
                        .child(div().flex_1())
                        .child(
                            PlopButton::new(
                                format!("show-{}", ticket.id),
                                if is_selected { "SHOWING" } else { "DETAILS" },
                                theme,
                                focus,
                            )
                            .small()
                            .fill(if is_selected {
                                Fill::Mustard
                            } else {
                                Fill::Plain
                            })
                            .on_click(select_ticket(ticket.id)),
                        ),
                );
                queue = queue.child(card);
            }
        }

        let detail = current.map(|ticket| {
            let resolving = self.resolving == Some(ticket.id);
            PlopSheet::new(format!("detail-{}", ticket.id), theme)
                .title(format!("#{} {}", ticket.id, ticket.kind))
                .child(
                    div()
                        .flex()
                        .items_center()
                        .gap(px(10.0))
                        .child(meta_text(
                            match &ticket.unit {
                                Some(unit) => format!("{} · {}", ticket.place, unit),
                                None => format!("{} · NO UNIT YET", ticket.place),
                            },
                            ink_soft,
                        ))
                        .child(PlopStatus::new(stage_status(ticket.stage), paper)),
                )
                .child(PlopStatusTimeline::new(STAGES, ticket.stage, paper))
                .child(
                    div()
                        .flex()
                        .items_center()
                        .gap(px(12.0))
                        .child(
                            PlopButton::new(
                                "advance",
                                action_label(ticket.stage),
                                theme,
                                self.focus_advance.clone(),
                            )
                            .fill(if ticket.stage == 3 {
                                Fill::Mint
                            } else {
                                Fill::Ink
                            })
                            .disabled(ticket.stage == 4)
                            .loading(resolving)
                            .loading_label("Resolving ticket")
                            .on_click(advance.clone()),
                        )
                        .child(meta_text(
                            if ticket.stage == 4 {
                                "CLOSED — NICE WORK".to_string()
                            } else {
                                format!("STAGE {} OF 5", ticket.stage + 1)
                            },
                            ink_soft,
                        )),
                )
        });

        let mut units = div().flex().flex_col().gap(px(12.0));
        for (name, crew) in UNITS {
            let job = open
                .iter()
                .find(|ticket| ticket.unit.as_deref() == Some(name));
            let mut card = PlopUnitCard::new(format!("unit-{name}"), name, theme);
            card = match job {
                Some(job) => {
                    let mut card = card.detail(crew).status(stage_status(job.stage));
                    if job.stage >= 2 {
                        card = card.eta("4 MIN");
                    }
                    card
                }
                None => card.detail(format!("{crew} · AVAILABLE")),
            };
            units = units.child(card);
        }

        div()
            .relative()
            .size_full()
            .tab_group()
            .flex()
            .flex_col()
            .bg(to_hsla(mode.bg))
            .text_color(on)
            .capture_key_down({
                let weak = weak.clone();
                move |event: &KeyDownEvent, window: &mut Window, cx: &mut App| {
                    let command =
                        event.keystroke.modifiers.platform || event.keystroke.modifiers.control;
                    if command && event.keystroke.key.as_str() == "enter" {
                        let _ = weak.update(cx, |this, cx| this.file_report(window, cx));
                        cx.stop_propagation();
                        return;
                    }
                    let _ = weak.update(cx, |this, cx| {
                        let search_focus = this.search.read(cx).focus_handle(cx);
                        let report_focus = this.kind.read(cx).focus_handle(cx);
                        let typing =
                            search_focus.is_focused(window) || report_focus.is_focused(window);
                        match event.keystroke.key.as_str() {
                            // `/` jumps to the queue search, the way the docs site does.
                            "/" if !typing => {
                                window.focus(&search_focus, cx);
                                cx.stop_propagation();
                            }
                            // Escape empties the search before it does anything else.
                            "escape" if search_focus.is_focused(window) => {
                                let has_query = !this.search.read(cx).value().trim().is_empty();
                                if has_query {
                                    this.search
                                        .update(cx, |state, cx| state.set_value("", window, cx));
                                    cx.stop_propagation();
                                }
                            }
                            _ => {}
                        }
                    });
                }
            })
            .child(
                div()
                    .flex()
                    .items_end()
                    .justify_between()
                    .gap(px(24.0))
                    .px(px(34.0))
                    .pt(px(30.0))
                    .pb(px(18.0))
                    .child(
                        div()
                            .flex()
                            .flex_col()
                            .gap(px(6.0))
                            .child(
                                div()
                                    .font_family(FONT)
                                    .text_size(px(XS))
                                    .text_color(soft)
                                    .child("PLOP! GPUI DISPATCH"),
                            )
                            .child(PlopHeading::new("BARANGAY DISPATCH", 1, theme)),
                    )
                    .child(
                        div()
                            .flex()
                            .items_center()
                            .gap(px(14.0))
                            .child(PlopTag::new("LIVE FEED", Fill::Mint, theme))
                            .child(PlopCount::new(open.len() as u32))
                            .child(
                                div()
                                    .font_family(FONT)
                                    .text_size(px(XS))
                                    .text_color(soft)
                                    .child("OPEN"),
                            )
                            .when(critical > 0, |row| {
                                row.child(PlopTag::new(
                                    format!("{critical} CRITICAL"),
                                    Fill::Tomato,
                                    theme,
                                ))
                            })
                            .child(
                                PlopButton::new(
                                    "night",
                                    if self.dark { "DAY" } else { "NIGHT" },
                                    theme,
                                    self.focus_night.clone(),
                                )
                                .small()
                                .fill(Fill::Plain)
                                .on_click(toggle_night),
                            ),
                    ),
            )
            .child(PlopDivider::new(theme))
            .child(
                div()
                    .flex()
                    .flex_1()
                    .gap(px(28.0))
                    .px(px(34.0))
                    .pt(px(20.0))
                    .pb(px(30.0))
                    .min_h_0()
                    .child(
                        div()
                            .w(px(560.0))
                            .flex()
                            .flex_col()
                            .gap(px(14.0))
                            .min_h_0()
                            .child(
                                div()
                                    .flex()
                                    .items_center()
                                    .gap(px(10.0))
                                    .child(meta_text("QUEUE", mode.on_soft))
                                    .child(PlopCount::new(open.len() as u32)),
                            )
                            .child(PlopSearchField::new(
                                self.search.clone(),
                                "Search tickets",
                                theme,
                            ))
                            .child(
                                PlopTabs::new(
                                    "queue-tabs",
                                    vec!["OPEN".into(), "RESOLVED".into()],
                                    self.tab,
                                    self.focus_tabs.to_vec(),
                                    theme,
                                )
                                .on_select(set_tab),
                            )
                            .child(queue),
                    )
                    .child(
                        div()
                            .flex_1()
                            .flex()
                            .flex_col()
                            .gap(px(16.0))
                            .min_h_0()
                            .child(meta_text("TICKET", mode.on_soft))
                            .children(detail)
                            .child(meta_text("UNITS", mode.on_soft))
                            .child(units)
                            .child(
                                PlopCard::new("report-card", theme)
                                    .title("FILE A REPORT")
                                    .child(
                                        div()
                                            .flex()
                                            .items_end()
                                            .gap(px(12.0))
                                            .child(div().flex_1().child(PlopTextField::new(
                                                self.kind.clone(),
                                                "WHAT HAPPENED?",
                                                theme.on_paper(),
                                            )))
                                            .child(
                                                PlopButton::new(
                                                    "send-report",
                                                    "SEND",
                                                    theme,
                                                    self.focus_send.clone(),
                                                )
                                                .small()
                                                .fill(Fill::Mustard)
                                                .on_click(send),
                                            )
                                            .child(meta_text("CMD+ENTER", ink_soft)),
                                    ),
                            ),
                    ),
            )
            .child(self.ink_host.clone())
            .child(self.toast_host.clone())
    }
}

fn load_fonts(cx: &mut App) {
    let fonts: Vec<Cow<'static, [u8]>> = vec![
        Cow::Borrowed(include_bytes!("../assets/fonts/sketchpop-regular.ttf").as_slice()),
        Cow::Borrowed(include_bytes!("../assets/fonts/sketchpop-regular-italic.ttf").as_slice()),
        Cow::Borrowed(include_bytes!("../assets/fonts/sketchpop-bold.ttf").as_slice()),
        Cow::Borrowed(include_bytes!("../assets/fonts/sketchpop-bold-italic.ttf").as_slice()),
        Cow::Borrowed(include_bytes!("../assets/fonts/sketchpop-black.ttf").as_slice()),
        Cow::Borrowed(include_bytes!("../assets/fonts/sketchpop-black-italic.ttf").as_slice()),
    ];
    cx.text_system()
        .add_fonts(fonts)
        .expect("Sketchpop should load");
}

fn capture() {
    let height = std::env::var("PLOP_CAPTURE_HEIGHT")
        .ok()
        .and_then(|value| value.parse().ok())
        .unwrap_or(1120.0);
    let text_system = current_platform(false).text_system();
    let mut cx = HeadlessAppContext::with_platform(text_system, std::sync::Arc::new(()), || {
        current_headless_renderer()
    });
    cx.update(|cx| {
        load_fonts(cx);
        gpui_kit::init(cx);
        PlopTheme::init(cx);
    });

    let window = cx
        .open_window(size(px(1240.0), px(height)), |window, cx| {
            cx.new(|cx| Dispatch::new(window, cx))
        })
        .expect("open headless window");
    cx.run_until_parked();
    let image = cx
        .capture_screenshot(window.into())
        .expect("capture dispatch");
    let out = std::env::var("PLOP_CAPTURE_OUT")
        .unwrap_or_else(|_| "/tmp/plopui-dispatch.png".to_string());
    image.save(&out).expect("write capture output");
    println!("saved {out} ({}x{})", image.width(), image.height());
}

fn main() {
    if std::env::var("PLOP_CAPTURE_OUT").is_ok() {
        capture();
        return;
    }
    gpui_kit::application().run(|cx| {
        load_fonts(cx);
        gpui_kit::init(cx);
        PlopTheme::init(cx);
        gpui_kit::open_window(
            WindowOptions {
                window_bounds: Some(WindowBounds::Windowed(Bounds::new(
                    point(px(80.0), px(80.0)),
                    size(px(1240.0), px(1120.0)),
                ))),
                window_min_size: Some(size(px(1024.0), px(860.0))),
                ..Default::default()
            },
            cx,
            |window, cx| cx.new(|cx| Dispatch::new(window, cx)),
        )
        .expect("open dispatch window");
    });
}
