(self["webpackChunkcraft"] = self["webpackChunkcraft"] || []).push([
    [230], {
        1230: (e, n, t) => {
            "use strict";
            t.r(n), t.d(n, {
                default: () => p
            });
            var a = t(3673),
                l = t(8767),
                o = t.n(l);

            function r(e, n, t, l, r, g) {
                const s = (0, a.up)("q-btn"),
                    c = (0, a.up)("q-img"),
                    i = (0, a.up)("q-page");
                return (0, a.wg)(), (0, a.j4)(i, {
                    class: "flex flex-center"
                }, {
                    default: (0, a.w5)((() => [(0, a.Wm)(s, {
                        outline: "",
                        to: "Builder",
                        onClick: e.navigatePage,
                        color: "blue-grey-4",
                        label: "Celestial Builder"
                    }, null, 8, ["onClick"]), (0, a.Wm)(c, {
                        alt: "forgemaster dot jpeg",
                        src: o(),
                        fit: "scale-down"
                    })])),
                    _: 1
                })
            }
            const g = (0, a.aZ)({
                name: "PageIndex",
                setup() {
                    function e(e, n) {
                        e.preventDefault(), console.log("triggering navigation is 2s"), setTimeout((() => {
                            console.log("navigating"), n()
                        }), 2e3)
                    }
                    return {
                        navigatePage: e
                    }
                }
            });
            var s = t(4379),
                c = t(4607),
                i = t(4027),
                u = t(7518),
                f = t.n(u);
            g.render = r;
            const p = g;
            f()(g, "components", {
                QPage: s.Z,
                QBtn: c.Z,
                QImg: i.Z
            })
        },
        8767: (e, n, t) => {
            e.exports = t.p + "img/forgemaster.2eece65c.jpeg"
        }
    }
]);