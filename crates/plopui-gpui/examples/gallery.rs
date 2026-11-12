//! A gallery for the GPUI port of PlopUI.
//!
//! Run with: cargo run -p plopui-gpui --example gallery

use std::borrow::Cow;

use gpui_kit::base::input::{InputState, TextareaState};
use gpui_kit::base::slider::SliderState;
use gpui_kit::prelude::FluentBuilder as _;
use gpui_kit::*;
use plopui_core::theme::{Fill, Status, SurfaceName};
use plopui_gpui::{
    AvatarStatus, BuddyMood, CalloutTone, DoodleKind, FONT, IconKind, PlopAvatar, PlopAvatarStack,
    PlopBreadcrumb, PlopBuddy, PlopBuddyPeek, PlopButton, PlopButtonLink, PlopCallout, PlopCard,
    PlopCheckbox, PlopCommandPalette, PlopCount, PlopDivider, PlopDoodle, PlopEmptyState, PlopEta,
    PlopHeading, PlopIcon, PlopIconButton, PlopLettering, PlopLoader, PlopMenu, PlopMultiSelect,
    PlopProgress, PlopProgressRing, PlopRadioGroup, PlopSearchField, PlopSelect, PlopSheet,
    PlopSkeleton, PlopSkeletonText, PlopSlider, PlopSpinner, PlopStatus, PlopStatusDot,
    PlopStatusTimeline, PlopStickyNote, PlopSwitch, PlopTabPanel, PlopTabs, PlopTag, PlopTextArea,
    PlopTextField, PlopTheme, PlopTicketCard, PlopToast, PlopToastHost, PlopToaster, PlopUnitCard,
    PlopUnitCardRow, PlopWordSticker, SpinnerKind, ToastQueue, ToastTone, meta_text, plop_tooltip,
};

pub fn load_fonts(cx: &mut App) {
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

fn body_label(text: impl Into<SharedString>, color: plopui_core::theme::Rgb) -> Div {
    div()
        .font_family(FONT)
        .text_size(px(plopui_core::theme::XS))
        .font_weight(FontWeight(plopui_core::theme::WEIGHT_BODY as f32))
        .text_color(plopui_gpui::color::to_hsla(color))
        .child(text.into())
}

pub struct Gallery {
    surface: SurfaceName,
    dark: bool,
    name: Entity<InputState>,
    email: Entity<InputState>,
    bio: Entity<TextareaState>,
    effort: Entity<SliderState>,
    notify: bool,
    auto_assign: bool,
    plan: usize,
    count: i32,
    focus_buttons: [FocusHandle; 8],
    focus_surfaces: [FocusHandle; 5],
    focus_checkboxes: [FocusHandle; 2],
    focus_switch: FocusHandle,
    focus_radios: [FocusHandle; 3],
    focus_slider: FocusHandle,
    focus_tabs: [FocusHandle; 3],
    tab: usize,
    select_open: bool,
    select_value: usize,
    multi_open: bool,
    multi_values: [bool; 3],
    menu_open: bool,
    palette_open: bool,
    palette_selected: usize,
    query: Entity<InputState>,
    search: Entity<InputState>,
    focus_select: FocusHandle,
    focus_multi: FocusHandle,
    focus_multi_options: [FocusHandle; 3],
    focus_menu: FocusHandle,
    focus_menu_items: [FocusHandle; 3],
    focus_link: FocusHandle,
    focus_icons: [FocusHandle; 2],
    focus_toast: FocusHandle,
    toasts: Entity<ToastQueue>,
    toast_host: Entity<PlopToastHost>,
    ink_host: Entity<plopui_gpui::PlopInkBurstHost>,
}

const SURFACES: [SurfaceName; 5] = [
    SurfaceName::Poster,
    SurfaceName::Mat,
    SurfaceName::Notebook,
    SurfaceName::Kraft,
    SurfaceName::Riso,
];

impl Gallery {
    pub fn new(window: &mut Window, cx: &mut Context<Self>) -> Self {
        let name = cx.new(|cx| {
            InputState::new(window, cx)
                .placeholder("Ada Lovelace")
                .default_value("Grace Hopper")
        });
        let email = cx.new(|cx| {
            InputState::new(window, cx)
                .placeholder("ada@plop.ui")
                .default_value("grace@plop.ui")
        });
        let bio = cx.new(|cx| {
            TextareaState::new(window, cx)
                .rows(4)
                .placeholder("What should the driver know?")
                .default_value("Gate code 4412. The van is late. Send snacks.")
        });
        let effort = cx.new(|_| {
            SliderState::new()
                .min(0.0)
                .max(100.0)
                .step(5.0)
                .default_value(40.0)
        });
        let query = cx.new(|cx| {
            InputState::new(window, cx)
                .placeholder("Type a command…")
                .default_value("")
        });
        let search = cx.new(|cx| {
            InputState::new(window, cx)
                .placeholder("Search tickets")
                .default_value("")
        });
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
            name,
            email,
            bio,
            effort,
            notify: true,
            auto_assign: false,
            plan: 0,
            count: 0,
            focus_buttons: std::array::from_fn(|_| cx.focus_handle()),
            focus_surfaces: std::array::from_fn(|_| cx.focus_handle()),
            focus_checkboxes: std::array::from_fn(|_| cx.focus_handle()),
            focus_switch: cx.focus_handle(),
            focus_radios: std::array::from_fn(|_| cx.focus_handle()),
            focus_slider: cx.focus_handle(),
            focus_tabs: std::array::from_fn(|_| cx.focus_handle()),
            tab: 0,
            select_open: false,
            select_value: 0,
            multi_open: false,
            multi_values: [true, false, false],
            menu_open: false,
            palette_open: false,
            palette_selected: 0,
            query,
            search,
            focus_select: cx.focus_handle(),
            focus_multi: cx.focus_handle(),
            focus_multi_options: std::array::from_fn(|_| cx.focus_handle()),
            focus_menu: cx.focus_handle(),
            focus_menu_items: std::array::from_fn(|_| cx.focus_handle()),
            focus_link: cx.focus_handle(),
            focus_icons: std::array::from_fn(|_| cx.focus_handle()),
            focus_toast: cx.focus_handle(),
            toasts,
            toast_host,
            ink_host,
        }
    }
}

impl Render for Gallery {
    fn render(&mut self, _window: &mut Window, cx: &mut Context<Self>) -> impl IntoElement {
        let theme = PlopTheme {
            surface: self.surface,
            dark: self.dark,
        };
        let mode = theme.mode();
        let weak = cx.entity().downgrade();
        let query_focus = self.query.read(cx).focus_handle(cx).clone();

        let open_palette = {
            let weak = weak.clone();
            let focus = query_focus.clone();
            move |_: &ClickEvent, window: &mut Window, cx: &mut App| {
                let _ = weak.update(cx, |this, cx| {
                    this.palette_open = true;
                    this.palette_selected = 0;
                    cx.notify();
                });
                window.focus(&focus, cx);
            }
        };

        let surface_click = |surface: SurfaceName| {
            let weak = weak.clone();
            move |_: &ClickEvent, _: &mut Window, cx: &mut App| {
                let _ = weak.update(cx, |this, cx| {
                    this.surface = surface;
                    cx.notify();
                });
            }
        };
        let set_notify = {
            let weak = weak.clone();
            move |next: bool, _: &ClickEvent, _: &mut Window, cx: &mut App| {
                let _ = weak.update(cx, |this, cx| {
                    this.notify = next;
                    cx.notify();
                });
            }
        };
        let set_auto_assign = {
            let weak = weak.clone();
            move |next: bool, _: &ClickEvent, _: &mut Window, cx: &mut App| {
                let _ = weak.update(cx, |this, cx| {
                    this.auto_assign = next;
                    cx.notify();
                });
            }
        };
        let set_plan = {
            let weak = weak.clone();
            move |plan: usize, _: &mut Window, cx: &mut App| {
                let _ = weak.update(cx, |this, cx| {
                    this.plan = plan;
                    cx.notify();
                });
            }
        };
        let set_tab = {
            let weak = weak.clone();
            move |tab: usize, _: &mut Window, cx: &mut App| {
                let _ = weak.update(cx, |this, cx| {
                    this.tab = tab;
                    cx.notify();
                });
            }
        };
        let set_select_open = {
            let weak = weak.clone();
            move |open: bool, _: &mut Window, cx: &mut App| {
                let _ = weak.update(cx, |this, cx| {
                    this.select_open = open;
                    cx.notify();
                });
            }
        };
        let set_select_value = {
            let weak = weak.clone();
            move |value: usize, _: &mut Window, cx: &mut App| {
                let _ = weak.update(cx, |this, cx| {
                    this.select_value = value;
                    this.select_open = false;
                    cx.notify();
                });
            }
        };
        let set_multi_open = {
            let weak = weak.clone();
            move |open: bool, _: &mut Window, cx: &mut App| {
                let _ = weak.update(cx, |this, cx| {
                    this.multi_open = open;
                    cx.notify();
                });
            }
        };
        let toggle_multi = {
            let weak = weak.clone();
            move |index: usize, _: &mut Window, cx: &mut App| {
                let _ = weak.update(cx, |this, cx| {
                    if let Some(value) = this.multi_values.get_mut(index) {
                        *value = !*value;
                    }
                    cx.notify();
                });
            }
        };
        let set_menu_open = {
            let weak = weak.clone();
            move |open: bool, _: &mut Window, cx: &mut App| {
                let _ = weak.update(cx, |this, cx| {
                    this.menu_open = open;
                    cx.notify();
                });
            }
        };
        let set_palette_selected = {
            let weak = weak.clone();
            move |index: usize, _: &mut Window, cx: &mut App| {
                let _ = weak.update(cx, |this, cx| {
                    this.palette_selected = index;
                    cx.notify();
                });
            }
        };
        let confirm_palette = {
            let weak = weak.clone();
            move |index: usize, _: &mut Window, cx: &mut App| {
                let _ = weak.update(cx, |this, cx| {
                    this.count += index as i32 + 1;
                    this.palette_open = false;
                    cx.notify();
                });
            }
        };
        let inc = {
            let weak = weak.clone();
            move |_: &ClickEvent, _: &mut Window, cx: &mut App| {
                let _ = weak.update(cx, |this, cx| {
                    this.count += 1;
                    cx.notify();
                });
            }
        };
        let inc2 = {
            let weak = weak.clone();
            move |_: &ClickEvent, _: &mut Window, cx: &mut App| {
                let _ = weak.update(cx, |this, cx| {
                    this.count += 1;
                    cx.notify();
                });
            }
        };
        let toggle_dark = {
            let weak = weak.clone();
            move |_: &ClickEvent, _: &mut Window, cx: &mut App| {
                let _ = weak.update(cx, |this, cx| {
                    this.dark = !this.dark;
                    cx.notify();
                });
            }
        };

        let progress = (0.35 + self.count as f32 * 0.045).clamp(0.0, 1.0);

        div()
            .id("gallery-scroll")
            .relative()
            .size_full()
            .overflow_y_scroll()
            .bg(plopui_gpui::color::to_hsla(mode.bg))
            .font_family(FONT)
            .text_size(px(19.0))
            .text_color(plopui_gpui::color::to_hsla(mode.on))
            .child(
                div().absolute().inset_0().child(
                    canvas(
                        move |bounds, _, _| bounds,
                        move |bounds, _, window, _| {
                            plopui_gpui::paint::paint_surface_pattern(
                                window,
                                bounds,
                                theme.surface,
                                mode,
                            )
                        },
                    )
                    .absolute()
                    .inset_0(),
                ),
            )
            .child(
                div()
                    .relative()
                    .max_w(px(1160.0))
                    .mx_auto()
                    .px(px(56.0))
                    .py(px(44.0))
                    .flex()
                    .flex_col()
                    .gap(px(34.0))
                    // ---------- header ----------
                    .child(
                        div()
                            .flex()
                            .items_end()
                            .justify_between()
                            .gap(px(20.0))
                            .child(
                                div()
                                    .flex()
                                    .items_end()
                                    .gap(px(14.0))
                                    .child(
                                        div()
                                            .font_family(FONT)
                                            .text_size(px(40.0))
                                            .font_weight(FontWeight(900.0))
                                            .italic()
                                            .text_color(plopui_gpui::color::to_hsla(mode.on))
                                            .child("PLOPUI"),
                                    )
                                    .child(
                                        div()
                                            .pb(px(6.0))
                                            .child(meta_text("for GPUI", mode.on_soft)),
                                    ),
                            )
                            .child(
                                div()
                                    .flex()
                                    .items_center()
                                    .gap(px(8.0))
                                    .children((0..5).map(|i| {
                                        let surface = SURFACES[i];
                                        let selected = self.surface == surface;
                                        PlopButton::new(
                                            ("surface", i),
                                            surface.label(),
                                            theme,
                                            self.focus_surfaces[i].clone(),
                                        )
                                        .small()
                                        .fill(if selected { Fill::Ink } else { Fill::Plain })
                                        .on_click(surface_click(surface))
                                    }))
                                    .child(
                                        PlopButton::new(
                                            "palette",
                                            "⌘K",
                                            theme,
                                            self.focus_buttons[5].clone(),
                                        )
                                        .small()
                                        .fill(Fill::Plain)
                                        .on_click(open_palette),
                                    )
                                    .child(
                                        PlopButton::new(
                                            "night",
                                            if self.dark { "DAY" } else { "NIGHT" },
                                            theme,
                                            self.focus_buttons[7].clone(),
                                        )
                                        .small()
                                        .fill(Fill::Mustard)
                                        .on_click(toggle_dark),
                                    ),
                            ),
                    )
                    // ---------- hero ----------
                    .child(
                        div()
                            .flex()
                            .flex_col()
                            .gap(px(14.0))
                            .child(PlopHeading::new("HAND-DRAWN UI. NATIVE SPEED.", 1, theme))
                            .child(
                                div()
                                    .max_w(px(700.0))
                                    .text_size(px(21.0))
                                    .text_color(plopui_gpui::color::to_hsla(mode.on_soft))
                                    .child(
                                        "PlopUI's cobalt ink, cream paper and imperfect edges, \
                                         rebuilt for GPUI. Deterministic seeds, real focus, \
                                         real keyboard.",
                                    ),
                            ),
                    )
                    .child(PlopDivider::new(theme))
                    // ---------- buttons ----------
                    .child(
                        div()
                            .flex()
                            .flex_col()
                            .gap(px(16.0))
                            .child(meta_text("BUTTONS", mode.on_soft))
                            .child(
                                div()
                                    .flex()
                                    .items_center()
                                    .flex_wrap()
                                    .gap(px(14.0))
                                    .child(
                                        PlopButton::new(
                                            "save",
                                            "SAVE TICKET",
                                            theme,
                                            self.focus_buttons[0].clone(),
                                        )
                                        .on_click(inc),
                                    )
                                    .child(
                                        PlopButton::new(
                                            "dispatch",
                                            "DISPATCH",
                                            theme,
                                            self.focus_buttons[1].clone(),
                                        )
                                        .fill(Fill::Mustard)
                                        .on_click(inc2),
                                    )
                                    .child(
                                        PlopButton::new(
                                            "resolve",
                                            "RESOLVE",
                                            theme,
                                            self.focus_buttons[2].clone(),
                                        )
                                        .fill(Fill::Mint)
                                        .icon(IconKind::Check)
                                        .on_click({
                                            let weak = weak.clone();
                                            move |_: &ClickEvent, _: &mut Window, cx: &mut App| {
                                                let _ = weak.update(cx, |this, cx| {
                                                    this.count = 0;
                                                    cx.notify();
                                                });
                                            }
                                        }),
                                    )
                                    .child(
                                        PlopButton::new(
                                            "delete",
                                            "DELETE",
                                            theme,
                                            self.focus_buttons[3].clone(),
                                        )
                                        .fill(Fill::Tomato),
                                    )
                                    .child(
                                        PlopButton::new(
                                            "ghost",
                                            "GHOST",
                                            theme,
                                            self.focus_buttons[4].clone(),
                                        )
                                        .fill(Fill::Plain),
                                    )
                                    .child(
                                        PlopButton::new(
                                            "small",
                                            "SMALL",
                                            theme,
                                            self.focus_buttons[5].clone(),
                                        )
                                        .small()
                                        .fill(Fill::Bubblegum),
                                    )
                                    .child(
                                        PlopButton::new(
                                            "plus",
                                            "ADD",
                                            theme,
                                            self.focus_buttons[6].clone(),
                                        )
                                        .small()
                                        .icon_only()
                                        .icon(IconKind::Plus)
                                        .fill(Fill::Periwinkle)
                                        .on_click({
                                            let weak = weak.clone();
                                            move |_: &ClickEvent, _: &mut Window, cx: &mut App| {
                                                let _ = weak.update(cx, |this, cx| {
                                                    this.count += 1;
                                                    cx.notify();
                                                });
                                            }
                                        }),
                                    )
                                    .child(
                                        PlopButton::new("locked", "LOCKED", theme, {
                                            // A disabled control does not need its own handle.
                                            self.focus_buttons[0].clone()
                                        })
                                        .disabled(true)
                                        .fill(Fill::Plain),
                                    )
                                    .child(
                                        PlopButton::new(
                                            "saving",
                                            "SAVING",
                                            theme,
                                            self.focus_buttons[7].clone(),
                                        )
                                        .small()
                                        .fill(Fill::Periwinkle)
                                        .loading(true),
                                    ),
                            )
                            .child(
                                div()
                                    .text_size(px(16.0))
                                    .text_color(plopui_gpui::color::to_hsla(mode.on_soft))
                                    .child(format!(
                                        "{} action{} so far — seed-stable, no random().",
                                        self.count,
                                        if self.count == 1 { "" } else { "s" }
                                    )),
                            ),
                    )
                    // ---------- breadcrumb ----------
                    .child(PlopBreadcrumb::new(
                        ["DISPATCH", "BOARD", "TICKET T-1042"],
                        theme,
                    ))
                    // ---------- controls ----------
                    .child(PlopDivider::new(theme))
                    .child(
                        div()
                            .flex()
                            .flex_col()
                            .gap(px(16.0))
                            .child(meta_text("CONTROLS", mode.on_soft))
                            .child(
                                div()
                                    .flex()
                                    .gap(px(26.0))
                                    .items_start()
                                    .child(
                                        div()
                                            .w(px(420.0))
                                            .flex()
                                            .flex_col()
                                            .gap(px(14.0))
                                            .child(
                                                div()
                                                    .relative()
                                                    .when(self.select_open, |column| {
                                                        column.pb(px(190.0))
                                                    })
                                                    .child(
                                                        PlopSelect::new(
                                                            "plan-select",
                                                            "PLAN",
                                                            vec![
                                                                "STANDARD".into(),
                                                                "EXPRESS".into(),
                                                                "OH NO".into(),
                                                            ],
                                                            self.select_value,
                                                            self.select_open,
                                                            self.focus_select.clone(),
                                                            theme,
                                                        )
                                                        .on_select(set_select_value)
                                                        .on_open_change(set_select_open),
                                                    ),
                                            )
                                            .child(
                                                div()
                                                    .relative()
                                                    .when(self.multi_open, |column| {
                                                        column.pb(px(190.0))
                                                    })
                                                    .child(
                                                        PlopMultiSelect::new(
                                                            "channels",
                                                            "CHANNELS",
                                                            vec![
                                                                "SMS".into(),
                                                                "EMAIL".into(),
                                                                "PUSH".into(),
                                                            ],
                                                            self.multi_values.to_vec(),
                                                            self.multi_open,
                                                            self.focus_multi.clone(),
                                                            self.focus_multi_options.to_vec(),
                                                            theme,
                                                        )
                                                        .on_toggle(toggle_multi)
                                                        .on_open_change(set_multi_open),
                                                    ),
                                            )
                                            .child(PlopSearchField::new(
                                                self.search.clone(),
                                                "Search tickets",
                                                theme,
                                            )),
                                    )
                                    .child(
                                        div()
                                            .w(px(420.0))
                                            .flex()
                                            .flex_col()
                                            .gap(px(16.0))
                                            .child(meta_text("MENU & LINK", mode.on_soft))
                                            .child(
                                                div()
                                                    .relative()
                                                    .when(self.menu_open, |column| {
                                                        column.pb(px(150.0))
                                                    })
                                                    .child(
                                                        PlopMenu::new(
                                                            "more-actions",
                                                            "MORE ACTIONS",
                                                            self.menu_open,
                                                            self.focus_menu.clone(),
                                                            self.focus_menu_items.to_vec(),
                                                            theme,
                                                        )
                                                        .item("ASSIGN UNIT", {
                                                            let weak = weak.clone();
                                                            move |_, cx| {
                                                                let _ =
                                                                    weak.update(cx, |this, cx| {
                                                                        this.count += 1;
                                                                        cx.notify();
                                                                    });
                                                            }
                                                        })
                                                        .item("COPY LINK", {
                                                            let weak = weak.clone();
                                                            move |_, cx| {
                                                                let _ =
                                                                    weak.update(cx, |this, cx| {
                                                                        this.count += 2;
                                                                        cx.notify();
                                                                    });
                                                            }
                                                        })
                                                        .item("RESOLVE", {
                                                            let weak = weak.clone();
                                                            move |_, cx| {
                                                                let _ =
                                                                    weak.update(cx, |this, cx| {
                                                                        this.count = 0;
                                                                        cx.notify();
                                                                    });
                                                            }
                                                        })
                                                        .on_open_change(set_menu_open),
                                                    ),
                                            )
                                            .child(
                                                div()
                                                    .flex()
                                                    .items_center()
                                                    .gap(px(16.0))
                                                    .child(
                                                        PlopButtonLink::new(
                                                            "OPEN DISPATCH BOARD",
                                                            self.focus_link.clone(),
                                                            theme,
                                                        )
                                                        .on_click({
                                                            let weak = weak.clone();
                                                            move |_, cx| {
                                                                let _ =
                                                                    weak.update(cx, |this, cx| {
                                                                        this.tab = 1;
                                                                        cx.notify();
                                                                    });
                                                            }
                                                        }),
                                                    )
                                                    .child(
                                                        div()
                                                            .id("save-tooltip-wrap")
                                                            .tooltip(plop_tooltip(
                                                                "Saves the ticket",
                                                                theme,
                                                            ))
                                                            .child(
                                                                PlopIconButton::with_icon(
                                                                    "save-icon",
                                                                    "SAVE TICKET",
                                                                    IconKind::Bell,
                                                                    self.focus_icons[0].clone(),
                                                                    theme,
                                                                )
                                                                .fill(Fill::Mustard),
                                                            ),
                                                    )
                                                    .child(
                                                        PlopIconButton::with_icon(
                                                            "copy-icon",
                                                            "COPY LINK",
                                                            IconKind::Link,
                                                            self.focus_icons[1].clone(),
                                                            theme,
                                                        )
                                                        .fill(Fill::Plain),
                                                    )
                                                    .child(
                                                        PlopIconButton::with_icon(
                                                            "trash-icon",
                                                            "DELETE TICKET",
                                                            IconKind::Trash,
                                                            self.focus_buttons[6].clone(),
                                                            theme,
                                                        )
                                                        .fill(Fill::Tomato),
                                                    ),
                                            )
                                            .child(
                                                PlopToaster::new()
                                                    .toast("DRAFT SAVED", CalloutTone::Success)
                                                    .toast("2 UNITS MOVED", CalloutTone::Info),
                                            )
                                            .child(
                                                PlopButton::new(
                                                    "toast-demo",
                                                    "SLAP A TOAST",
                                                    theme,
                                                    self.focus_toast.clone(),
                                                )
                                                .small()
                                                .fill(Fill::Mustard)
                                                .on_click({
                                                    let queue = self.toasts.clone();
                                                    move |_: &ClickEvent, _: &mut Window, cx: &mut App| {
                                                        queue.update(cx, |queue, cx| {
                                                            queue.show(
                                                                ToastTone::Success,
                                                                "SKETCH POSTED",
                                                                cx,
                                                            );
                                                        });
                                                    }
                                                }),
                                            ),
                                    ),
                            ),
                    )
                    // ---------- form ----------
                    .child(PlopDivider::new(theme))
                    .child(
                        div()
                            .flex()
                            .flex_col()
                            .gap(px(16.0))
                            .child(meta_text("FORM", mode.on_soft))
                            .child(
                                div()
                                    .flex()
                                    .gap(px(22.0))
                                    .items_start()
                                    .child(
                                        PlopCard::new("form-card", theme)
                                            .title("WHO GOT DISPATCHED?")
                                            .child(
                                                div()
                                                    .w(px(400.0))
                                                    .flex()
                                                    .flex_col()
                                                    .gap(px(16.0))
                                                    .child(PlopTextField::new(
                                                        self.name.clone(),
                                                        "NAME",
                                                        theme,
                                                    ))
                                                    .child(
                                                        PlopTextField::new(
                                                            self.email.clone(),
                                                            "EMAIL",
                                                            theme,
                                                        )
                                                        .hint("We only write when the van moves."),
                                                    )
                                                    .child(PlopTextArea::new(
                                                        self.bio.clone(),
                                                        "DISPATCH NOTE",
                                                        theme,
                                                    ))
                                                    .child(PlopSlider::new(
                                                        self.effort.clone(),
                                                        "URGENCY",
                                                        self.focus_slider.clone(),
                                                        theme,
                                                    ))
                                                    .child(
                                                        PlopCheckbox::new(
                                                            "notify",
                                                            "NOTIFY ME ON ARRIVAL",
                                                            self.notify,
                                                            theme,
                                                            self.focus_checkboxes[0].clone(),
                                                        )
                                                        .on_change(set_notify),
                                                    )
                                                    .child(
                                                        PlopSwitch::new(
                                                            "auto",
                                                            "AUTO-ASSIGN NEAREST UNIT",
                                                            self.auto_assign,
                                                            theme,
                                                            self.focus_switch.clone(),
                                                        )
                                                        .on_change(set_auto_assign),
                                                    )
                                                    .child(
                                                        PlopRadioGroup::new(
                                                            "plan",
                                                            "PRIORITY",
                                                            vec![
                                                                "STANDARD".into(),
                                                                "EXPRESS".into(),
                                                                "OH NO".into(),
                                                            ],
                                                            self.plan,
                                                            self.focus_radios.to_vec(),
                                                            theme,
                                                        )
                                                        .on_change(set_plan),
                                                    ),
                                            ),
                                    )
                                    .child(
                                        PlopCard::new("note-card", theme)
                                            .tape()
                                            .title("FIELD NOTE")
                                            .child(
                                                div()
                                                    .w(px(360.0))
                                                    .text_size(px(19.0))
                                                    .text_color(plopui_gpui::color::to_hsla(
                                                        plopui_core::theme::color::INK_TEXT,
                                                    ))
                                                    .child(
                                                        "The wobble is geometry, not a filter. \
                                                         Each border is a rounded polyline \
                                                         pushed off true by a stable seed — so \
                                                         it paints the same on every frame.",
                                                    ),
                                            )
                                            .child(PlopTag::new(
                                                "deterministic",
                                                Fill::Periwinkle,
                                                theme,
                                            ))
                                            .child(PlopTag::new(
                                                "keyboard first",
                                                Fill::Mint,
                                                theme,
                                            )),
                                    ),
                            ),
                    )
                    // ---------- status + progress ----------
                    .child(PlopDivider::new(theme))
                    .child(
                        div()
                            .flex()
                            .gap(px(26.0))
                            .items_start()
                            .child(
                                div()
                                    .flex()
                                    .flex_col()
                                    .gap(px(14.0))
                                    .w(px(420.0))
                                    .child(meta_text("QUEUE", mode.on_soft))
                                    .child(
                                        PlopProgress::new(progress, theme)
                                            .label("DISPATCH RUN")
                                            .value_text(format!("{}%", (progress * 100.0) as i32))
                                            .fill(Fill::Mint),
                                    )
                                    .child(
                                        PlopProgress::new(0.82, theme)
                                            .label("UNITS ONLINE")
                                            .value_text("82%")
                                            .fill(Fill::Tomato),
                                    )
                                    .child(
                                        PlopButton::new(
                                            "advance",
                                            "ADVANCE RUN",
                                            theme,
                                            self.focus_buttons[1].clone(),
                                        )
                                        .small()
                                        .fill(Fill::Mustard)
                                        .on_click({
                                            let weak = weak.clone();
                                            move |_: &ClickEvent, _: &mut Window, cx: &mut App| {
                                                let _ = weak.update(cx, |this, cx| {
                                                    this.count += 1;
                                                    cx.notify();
                                                });
                                            }
                                        }),
                                    ),
                            )
                            .child(
                                div()
                                    .flex()
                                    .flex_col()
                                    .gap(px(12.0))
                                    .w(px(380.0))
                                    .child(meta_text("STATUS", mode.on_soft))
                                    .children(
                                        [
                                            Status::Critical,
                                            Status::Dispatched,
                                            Status::EnRoute,
                                            Status::Resolved,
                                            Status::Unassigned,
                                        ]
                                        .into_iter()
                                        .map(|status| PlopStatus::new(status, theme)),
                                    )
                                    .child(
                                        div()
                                            .flex()
                                            .items_center()
                                            .gap(px(18.0))
                                            .children(
                                                [
                                                    (Status::Critical, 8.0),
                                                    (Status::Dispatched, 12.0),
                                                    (Status::EnRoute, 16.0),
                                                    (Status::Resolved, 20.0),
                                                ]
                                                .into_iter()
                                                .map(|(status, size)| {
                                                    PlopStatusDot::new(
                                                        format!("status-dot-{}", status.label()),
                                                        status,
                                                    )
                                                    .size(size)
                                                }),
                                            ),
                                    ),
                            )
                            .child(
                                div()
                                    .flex()
                                    .flex_col()
                                    .gap(px(14.0))
                                    .child(meta_text("CREW", mode.on_soft))
                                    .child(
                                        div()
                                            .flex()
                                            .flex_col()
                                            .items_start()
                                            .gap(px(12.0))
                                            .child(
                                                PlopAvatarStack::new()
                                                    .person("Grace Hopper", Fill::Periwinkle)
                                                    .person("Ada Lovelace", Fill::Mint)
                                                    .person("Katherine Johnson", Fill::Mustard)
                                                    .person("Rosa Parks", Fill::Bubblegum)
                                                    .person("Sofia Nunes", Fill::Periwinkle)
                                                    .person("Mae Jemison", Fill::Tomato),
                                            )
                                            .child(
                                                div().flex().items_center().gap(px(14.0)).children(
                                                    [
                                                        ("Rosa Vega", AvatarStatus::Online),
                                                        ("Jun Reyes", AvatarStatus::Busy),
                                                        ("Ana Lima", AvatarStatus::Offline),
                                                    ]
                                                    .into_iter()
                                                    .map(|(person, status)| {
                                                        div()
                                                            .flex()
                                                            .flex_col()
                                                            .items_center()
                                                            .gap(px(5.0))
                                                            .child(
                                                                PlopAvatar::new(person)
                                                                    .size(46.0)
                                                                    .status(status),
                                                            )
                                                            .child(body_label(
                                                                status.label(),
                                                                mode.on_soft,
                                                            ))
                                                    }),
                                                ),
                                            ),
                                    ),
                            ),
                    )
                    // ---------- tabs + timeline ----------
                    .child(
                        div()
                            .flex()
                            .gap(px(26.0))
                            .items_start()
                            .child(
                                div()
                                    .flex()
                                    .flex_col()
                                    .gap(px(14.0))
                                    .flex_1()
                                    .child(meta_text("TABS", mode.on_soft))
                                    .child(
                                        PlopTabs::new(
                                            "queue-tabs",
                                            vec!["INBOX".into(), "ASSIGNED".into(), "LATE".into()],
                                            self.tab,
                                            self.focus_tabs.to_vec(),
                                            theme,
                                        )
                                        .on_select(set_tab),
                                    )
                                    .child(
                                        PlopCard::new("tab-card", theme)
                                            .title(match self.tab {
                                                0 => "INBOX: 3",
                                                1 => "ASSIGNED: 1",
                                                _ => "LATE: 2",
                                            })
                                            .children((0..3).map(|index| {
                                                PlopTabPanel::new(index, self.tab).child(
                                                    div()
                                                        .w(px(520.0))
                                                        .text_size(px(19.0))
                                                        .text_color(
                                                            plopui_gpui::color::to_hsla(
                                                                plopui_core::theme::color::INK_TEXT,
                                                            ),
                                                        )
                                                        .child(match index {
                                                            0 => "Three tickets wait for a unit.",
                                                            1 => "Unit 12 is rolling to Linden Ave.",
                                                            _ => {
                                                                "Two runs slipped past their window."
                                                            }
                                                        }),
                                                )
                                            })),
                                    ),
                            )
                            .child(
                                div()
                                    .flex()
                                    .flex_col()
                                    .gap(px(14.0))
                                    .w(px(500.0))
                                    .child(meta_text("TIMELINE", mode.on_soft))
                                    .child(PlopStatusTimeline::new(
                                        ["REPORTED", "DISPATCHED", "EN ROUTE", "ON SITE"],
                                        2,
                                        theme,
                                    ))
                                    .child(
                                        div()
                                            .flex()
                                            .items_center()
                                            .gap(px(20.0))
                                            .pt(px(8.0))
                                            .child(PlopSpinner::new("gallery-spinner").size(40.0))
                                            .child(PlopCount::new(self.count.max(0) as u32))
                                            .child(
                                                PlopAvatarStack::new()
                                                    .person("Grace Hopper", Fill::Periwinkle)
                                                    .person("Ada Lovelace", Fill::Mint)
                                                    .person("Katherine Johnson", Fill::Mustard)
                                                    .person("Rosa Parks", Fill::Bubblegum)
                                                    .person("Sofia Nunes", Fill::Periwinkle)
                                                    .max(3),
                                            ),
                                    ),
                            ),
                    )
                    // ---------- empty state ----------
                    .child(
                        div()
                            .flex()
                            .flex_col()
                            .gap(px(10.0))
                            .child(meta_text("EMPTY STATE", mode.on_soft))
                            .child(
                                PlopEmptyState::new("No tickets on this board", theme)
                                    .body("When a run is reported it lands here, already inked.")
                                    .action(
                                        PlopButton::new(
                                            "empty-refresh",
                                            "REFRESH BOARD",
                                            theme,
                                            self.focus_buttons[6].clone(),
                                        )
                                        .small()
                                        .fill(Fill::Plain)
                                        .on_click({
                                            let weak = weak.clone();
                                            move |_: &ClickEvent, _: &mut Window, cx: &mut App| {
                                                let _ = weak.update(cx, |this, cx| {
                                                    this.count += 1;
                                                    cx.notify();
                                                });
                                            }
                                        }),
                                    ),
                            ),
                    )
                    // ---------- waiting ----------
                    .child(PlopDivider::new(theme))
                    .child(
                        div()
                            .flex()
                            .flex_col()
                            .gap(px(16.0))
                            .child(meta_text("WAITING", mode.on_soft))
                            .child(div().flex().gap(px(36.0)).children(
                                SpinnerKind::ALL.into_iter().map(|kind| {
                                    div()
                                        .flex()
                                        .flex_col()
                                        .items_center()
                                        .gap(px(10.0))
                                        .child(
                                            PlopSpinner::new(("spinner-kind", kind as usize))
                                                .kind(kind)
                                                .size(46.0)
                                                .seed(kind.label()),
                                        )
                                        .child(body_label(kind.label(), mode.on_soft))
                                }),
                            )),
                    )
                    // ---------- icons ----------
                    .child(PlopDivider::new(theme))
                    .child(
                        div()
                            .flex()
                            .flex_col()
                            .gap(px(16.0))
                            .child(meta_text("ICONS", mode.on_soft))
                            .child(
                                div()
                                    .flex()
                                    .flex_wrap()
                                    .gap_x(px(26.0))
                                    .gap_y(px(18.0))
                                    .children(IconKind::ALL.into_iter().map(|kind| {
                                        div()
                                            .w(px(84.0))
                                            .flex()
                                            .flex_col()
                                            .items_center()
                                            .gap(px(6.0))
                                            .child(PlopIcon::new(kind, theme).size(28.0))
                                            .child(body_label(kind.label(), mode.on_soft))
                                    })),
                            ),
                    )
                    // ---------- paper ----------
                    .child(PlopDivider::new(theme))
                    .child(
                        div()
                            .flex()
                            .flex_col()
                            .gap(px(16.0))
                            .child(meta_text("PAPER", mode.on_soft))
                            .child(
                                div()
                                    .flex()
                                    .gap(px(20.0))
                                    .items_start()
                                    .child(
                                        div().w(px(340.0)).child(
                                            PlopTicketCard::new("ticket-card", "LINDEN AVE", theme)
                                                .code("TICKET #1042 · PRIORITY 2")
                                                .status(Status::EnRoute)
                                                .child(
                                                    div()
                                                        .font_family(FONT)
                                                        .text_size(px(19.0))
                                                        .text_color(plopui_gpui::color::to_hsla(
                                                            plopui_core::theme::color::INK_TEXT,
                                                        ))
                                                        .child("Gate code 4412. Call on arrival."),
                                                ),
                                        ),
                                    )
                                    .child(
                                        div().w(px(300.0)).child(
                                            PlopStickyNote::new("sticky-card", theme)
                                                .title("FIELD NOTE")
                                                .body("The wobble is geometry, not a filter."),
                                        ),
                                    )
                                    .child(
                                        div()
                                            .w(px(400.0))
                                            .flex()
                                            .flex_col()
                                            .gap(px(10.0))
                                            .child(
                                                PlopUnitCard::new("unit-12", "UNIT 12", theme)
                                                    .detail("2 blocks away")
                                                    .status(Status::EnRoute)
                                                    .eta("4 min"),
                                            )
                                            .child(
                                                PlopUnitCard::new("unit-7", "UNIT 7", theme)
                                                    .detail("Idle at depot")
                                                    .status(Status::Dispatched)
                                                    .eta("12 min"),
                                            ),
                                    ),
                            )
                            .child(
                                div()
                                    .flex()
                                    .items_center()
                                    .gap(px(28.0))
                                    .child(
                                        PlopProgressRing::new(0.62, theme).size(96.0).label("RUN"),
                                    )
                                    .child(
                                        div().w(px(280.0)).child(
                                            PlopCard::new("skeleton-card", theme)
                                                .title("DRAFT")
                                                // The card is cream paper, so the scrap takes
                                                // the paper theme even when the page is dark.
                                                .child(PlopSkeletonText::new(
                                                    220.0,
                                                    3,
                                                    "sk-text",
                                                    theme.on_paper(),
                                                )),
                                        ),
                                    )
                                    .child(PlopWordSticker::new("SHIP IT", Fill::Mustard))
                                    .children(DoodleKind::ALL.map(|kind| {
                                        PlopDoodle::new(kind).size(38.0).color(mode.on)
                                    }))
                                    .child(PlopLoader::new("INKING…", theme)),
                            )
                            .child(
                                div()
                                    .flex()
                                    .flex_col()
                                    .gap(px(16.0))
                                    .child(
                                        PlopUnitCardRow::new()
                                            .child(
                                                PlopUnitCard::new("row-unit-3", "UNIT 3", theme)
                                                    .detail("Gate code 4412")
                                                    .status(Status::EnRoute)
                                                    .eta("4 min"),
                                            )
                                            .child(
                                                PlopUnitCard::new("row-unit-9", "UNIT 9", theme)
                                                    .detail("Idle at depot")
                                                    .status(Status::Dispatched)
                                                    .eta("12 min"),
                                            ),
                                    )
                                    .child(
                                        div()
                                            .flex()
                                            .items_center()
                                            .gap(px(22.0))
                                            .child(
                                                PlopLettering::new("SHIP IT", theme)
                                                    .size(36.0)
                                                    .underline(true),
                                            )
                                            .child(PlopEta::new("4 MIN"))
                                            .child(PlopEta::new("12 MIN")),
                                    ),
                            )
                            .child(
                                div().w_full().max_w(px(820.0)).child(
                                    PlopSheet::new("run-sheet", theme).title("RUN SHEET").child(
                                        div()
                                            .font_family(FONT)
                                            .text_size(px(19.0))
                                            .child("Two units, one gate code, no drama."),
                                    ),
                                ),
                            )
                            .child(
                                div()
                                    .flex()
                                    .items_end()
                                    .gap(px(10.0))
                                    .child(PlopBuddyPeek::new(BuddyMood::Success).size(96.0))
                                    .child(PlopBuddyPeek::new(BuddyMood::Thinking).size(96.0))
                                    .child(PlopBuddyPeek::new(BuddyMood::Congrats).size(96.0)),
                            ),
                    )
                    // ---------- cast ----------
                    .child(
                        div()
                            .flex()
                            .flex_col()
                            .gap(px(14.0))
                            .child(meta_text("CAST", mode.on_soft))
                            .child(div().flex().items_end().gap(px(22.0)).children(
                                BuddyMood::ALL.map(|mood| {
                                    div()
                                        .flex()
                                        .flex_col()
                                        .items_center()
                                        .gap(px(6.0))
                                        .child(PlopBuddy::new(mood).size(72.0))
                                        .child(body_label(
                                            mood.label().to_uppercase(),
                                            mode.on_soft,
                                        ))
                                }),
                            )),
                    )
                    // ---------- callouts ----------
                    .child(
                        div()
                            .flex()
                            .gap(px(20.0))
                            .child(
                                div().w(px(500.0)).child(
                                    PlopCallout::new(
                                        "callout-info",
                                        CalloutTone::Info,
                                        "Every control is reachable by Tab. Enter and Space \
                                         activate; arrows move through radio groups.",
                                    )
                                    .title("KEYBOARD"),
                                ),
                            )
                            .child(
                                div().w(px(500.0)).child(
                                    PlopCallout::new(
                                        "callout-warn",
                                        CalloutTone::Warn,
                                        "CSS displacement filters are intentionally not ported. \
                                         The wobble comes from seeded polylines instead.",
                                    )
                                    .title("HONEST LIMIT"),
                                ),
                            ),
                    )
                    // ---------- skeleton + toast ----------
                    .child(
                        div()
                            .flex()
                            .items_center()
                            .gap(px(22.0))
                            .child(PlopSkeleton::new(260.0, 22.0, "sk-1", theme))
                            .child(PlopSkeleton::new(180.0, 22.0, "sk-2", theme))
                            .child(PlopSkeleton::new(52.0, 52.0, "sk-3", theme))
                            .child(PlopToast::new("DRAFT SAVED", CalloutTone::Success)),
                    )
                    // ---------- footer ----------
                    .child(PlopDivider::new(theme))
                    .child(
                        div()
                            .flex()
                            .items_center()
                            .justify_between()
                            .child(meta_text("PLOPUI × GPUI — KIT 02", mode.on_soft))
                            .child(meta_text(
                                "MIT tokens · OFL Sketchpop · Apache-2.0 GPUI",
                                mode.on_soft,
                            )),
                    )
                    .child(
                        PlopCommandPalette::new(
                            self.palette_open,
                            self.query.clone(),
                            vec![
                                "OPEN DISPATCH".into(),
                                "ASSIGN UNIT".into(),
                                "MUTE ALERTS".into(),
                                "RESOLVE TICKET".into(),
                            ],
                            self.palette_selected,
                            theme,
                        )
                        .on_move(set_palette_selected)
                        .on_confirm(confirm_palette)
                        .on_close({
                            let weak = weak.clone();
                            move |_, cx| {
                                let _ = weak.update(cx, |this, cx| {
                                    this.palette_open = false;
                                    cx.notify();
                                });
                            }
                        }),
                    )
                    .child(self.ink_host.clone())
                    .child(self.toast_host.clone()),
            )
    }
}

#[allow(dead_code)]
fn main() {
    gpui_kit::application().run(|cx| {
        load_fonts(cx);
        gpui_kit::init(cx);
        PlopTheme::init(cx);
        gpui_kit::open_window(
            WindowOptions {
                window_bounds: Some(WindowBounds::Windowed(Bounds::new(
                    point(px(80.0), px(80.0)),
                    size(px(1240.0), px(920.0)),
                ))),
                ..Default::default()
            },
            cx,
            |window, cx| cx.new(|cx| Gallery::new(window, cx)),
        )
        .expect("open gallery window");
    });
}
