(self["webpackChunkcraft"] = self["webpackChunkcraft"] || []).push([
    [885], {
        3885: (e, t, l) => {
            "use strict";
            l.r(t), l.d(t, {
                default: () => I
            });
            var a = l(3673);
            const n = (0, a.Uk)(" Craft "),
                r = (0, a.Wm)("div", null, " Craft v0.0.1", -1),
                u = (0, a.Uk)(" Links "),
                o = (0, a.Wm)("div", null, " Copyright © 2022 Stained.Glass ", -1);

            function i(e, t, l, i, c, s) {
                const p = (0, a.up)("q-btn"),
                    m = (0, a.up)("q-toolbar-title"),
                    d = (0, a.up)("q-toolbar"),
                    f = (0, a.up)("q-header"),
                    w = (0, a.up)("q-item-label"),
                    g = (0, a.up)("EssentialLink"),
                    b = (0, a.up)("q-list"),
                    k = (0, a.up)("q-drawer"),
                    Z = (0, a.up)("router-view"),
                    W = (0, a.up)("q-page-container"),
                    q = (0, a.up)("q-footer"),
                    y = (0, a.up)("q-layout");
                return (0, a.wg)(), (0, a.j4)(y, {
                    view: "lHh Lpr lFf"
                }, {
                    default: (0, a.w5)((() => [(0, a.Wm)(f, {
                        elevated: "",
                        class: "bg-blue-grey-10"
                    }, {
                        default: (0, a.w5)((() => [(0, a.Wm)(d, null, {
                            default: (0, a.w5)((() => [(0, a.Wm)(p, {
                                flat: "",
                                dense: "",
                                round: "",
                                icon: "menu",
                                "aria-label": "Menu",
                                onClick: e.toggleLeftDrawer
                            }, null, 8, ["onClick"]), (0, a.Wm)(m, null, {
                                default: (0, a.w5)((() => [n])),
                                _: 1
                            }), r])),
                            _: 1
                        })])),
                        _: 1
                    }), (0, a.Wm)(k, {
                        modelValue: e.leftDrawerOpen,
                        "onUpdate:modelValue": t[1] || (t[1] = t => e.leftDrawerOpen = t),
                        bordered: "",
                        class: "bg-grey-1"
                    }, {
                        default: (0, a.w5)((() => [(0, a.Wm)(b, null, {
                            default: (0, a.w5)((() => [(0, a.Wm)(w, {
                                header: "",
                                class: "text-grey-8"
                            }, {
                                default: (0, a.w5)((() => [u])),
                                _: 1
                            }), ((0, a.wg)(!0), (0, a.j4)(a.HY, null, (0, a.Ko)(e.essentialLinks, (e => ((0, a.wg)(), (0, a.j4)(g, (0, a.dG)({
                                key: e.title
                            }, e), null, 16)))), 128))])),
                            _: 1
                        })])),
                        _: 1
                    }, 8, ["modelValue"]), (0, a.Wm)(W, null, {
                        default: (0, a.w5)((() => [(0, a.Wm)(Z)])),
                        _: 1
                    }), (0, a.Wm)(q, {
                        class: "bg-blue-grey-10"
                    }, {
                        default: (0, a.w5)((() => [o])),
                        _: 1
                    })])),
                    _: 1
                })
            }
            var c = l(2323);

            function s(e, t, l, n, r, u) {
                const o = (0, a.up)("q-icon"),
                    i = (0, a.up)("q-item-section"),
                    s = (0, a.up)("q-item-label"),
                    p = (0, a.up)("q-item");
                return (0, a.wg)(), (0, a.j4)(p, {
                    clickable: "",
                    tag: "a",
                    target: "_blank",
                    href: e.link
                }, {
                    default: (0, a.w5)((() => [e.icon ? ((0, a.wg)(), (0, a.j4)(i, {
                        key: 0,
                        avatar: ""
                    }, {
                        default: (0, a.w5)((() => [(0, a.Wm)(o, {
                            name: e.icon
                        }, null, 8, ["name"])])),
                        _: 1
                    })) : (0, a.ry)("", !0), (0, a.Wm)(i, null, {
                        default: (0, a.w5)((() => [(0, a.Wm)(s, null, {
                            default: (0, a.w5)((() => [(0, a.Uk)((0, c.zw)(e.title), 1)])),
                            _: 1
                        }), (0, a.Wm)(s, {
                            caption: ""
                        }, {
                            default: (0, a.w5)((() => [(0, a.Uk)((0, c.zw)(e.caption), 1)])),
                            _: 1
                        })])),
                        _: 1
                    })])),
                    _: 1
                }, 8, ["href"])
            }
            const p = (0, a.aZ)({
                name: "EssentialLink",
                props: {
                    title: {
                        type: String,
                        required: !0
                    },
                    caption: {
                        type: String,
                        default: ""
                    },
                    link: {
                        type: String,
                        default: "#"
                    },
                    icon: {
                        type: String,
                        default: ""
                    }
                }
            });
            var m = l(3414),
                d = l(2035),
                f = l(4554),
                w = l(2350),
                g = l(7518),
                b = l.n(g);
            p.render = s;
            const k = p;
            b()(p, "components", {
                QItem: m.Z,
                QItemSection: d.Z,
                QIcon: f.Z,
                QItemLabel: w.Z
            });
            var Z = l(1959);
            const W = [{
                    title: "Github",
                    caption: "github.com/mpdperson/Celestial-Archive",
                    icon: "code",
                    link: "https://github.com/mpdperson/Celestial-Archive"
                }],
                q = (0, a.aZ)({
                    name: "MainLayout",
                    components: {
                        EssentialLink: k
                    },
                    setup() {
                        const e = (0, Z.iH)(!1);
                        return {
                            essentialLinks: W,
                            leftDrawerOpen: e,
                            toggleLeftDrawer() {
                                e.value = !e.value
                            }
                        }
                    }
                });
            var y = l(9214),
                _ = l(3812),
                v = l(9570),
                L = l(4607),
                Q = l(3747),
                h = l(223),
                C = l(7011),
                D = l(2652),
                j = l(1762);
            q.render = i;
            const I = q;
            b()(q, "components", {
                QLayout: y.Z,
                QHeader: _.Z,
                QToolbar: v.Z,
                QBtn: L.Z,
                QToolbarTitle: Q.Z,
                QDrawer: h.Z,
                QList: C.Z,
                QItemLabel: w.Z,
                QPageContainer: D.Z,
                QFooter: j.Z
            })
        }
    }
]);