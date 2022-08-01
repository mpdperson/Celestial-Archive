(() => {
    "use strict";
    var e = {
            216: (e, t, r) => {
                var n = r(8880),
                    o = r(7651),
                    a = r(3673);

                function i(e, t, r, n, o, i) {
                    const c = (0, a.up)("router-view");
                    return (0, a.wg)(), (0, a.j4)(c)
                }
                const c = (0, a.aZ)({
                    name: "App",
                    created() {
                        this.$q.dark.set(!0)
                    }
                });
                c.render = i;
                const s = c;
                var u = r(7083),
                    l = r(9582);
                r(71);
                const d = [{
                        path: "/",
                        component: () => Promise.all([r.e(736), r.e(885)]).then(r.bind(r, 3885)),
                        children: [{
                            path: "",
                            component: () => Promise.all([r.e(736), r.e(230)]).then(r.bind(r, 1230))
                        }, {
                            path: "builder",
                            component: () => Promise.all([r.e(736), r.e(372)]).then(r.bind(r, 6372))
                        }]
                    }, {
                        path: "/:catchAll(.*)*",
                        component: () => Promise.all([r.e(736), r.e(193)]).then(r.bind(r, 2193))
                    }],
                    p = d,
                    f = (0, u.BC)((function() {
                        const e = l.r5,
                            t = (0, l.p7)({
                                scrollBehavior: () => ({
                                    left: 0,
                                    top: 0
                                }),
                                routes: p,
                                history: e("")
                            });
                        return t
                    }));
                async function h(e, t) {
                    const r = "function" === typeof f ? await f({}) : f,
                        n = e(s);
                    return n.use(o.Z, t), {
                        app: n,
                        router: r
                    }
                }
                const v = {
                    config: {}
                };
                async function b({
                    app: e,
                    router: t
                }) {
                    e.use(t), e.mount("#q-app")
                }
                h(n.ri, v).then(b)
            }
        },
        t = {};

    function r(n) {
        var o = t[n];
        if (void 0 !== o) return o.exports;
        var a = t[n] = {
            exports: {}
        };
        return e[n](a, a.exports, r), a.exports
    }
    r.m = e, (() => {
        var e = [];
        r.O = (t, n, o, a) => {
            if (!n) {
                var i = 1 / 0;
                for (u = 0; u < e.length; u++) {
                    for (var [n, o, a] = e[u], c = !0, s = 0; s < n.length; s++)(!1 & a || i >= a) && Object.keys(r.O).every((e => r.O[e](n[s]))) ? n.splice(s--, 1) : (c = !1, a < i && (i = a));
                    c && (e.splice(u--, 1), t = o())
                }
                return t
            }
            a = a || 0;
            for (var u = e.length; u > 0 && e[u - 1][2] > a; u--) e[u] = e[u - 1];
            e[u] = [n, o, a]
        }
    })(), (() => {
        r.n = e => {
            var t = e && e.__esModule ? () => e["default"] : () => e;
            return r.d(t, {
                a: t
            }), t
        }
    })(), (() => {
        r.d = (e, t) => {
            for (var n in t) r.o(t, n) && !r.o(e, n) && Object.defineProperty(e, n, {
                enumerable: !0,
                get: t[n]
            })
        }
    })(), (() => {
        r.f = {}, r.e = e => Promise.all(Object.keys(r.f).reduce(((t, n) => (r.f[n](e, t), t)), []))
    })(), (() => {
        r.u = e => "builder/js/" + e + "." + {
            193: "381d75f4",
            230: "92cabe33",
            372: "7867eb5e",
            885: "c56b943f"
        } [e] + ".js"
    })(), (() => {
        r.miniCssF = e => "builder/css/vendor.51a978b7.css"
    })(), (() => {
        r.g = function() {
            if ("object" === typeof globalThis) return globalThis;
            try {
                return this || new Function("return this")()
            } catch (e) {
                if ("object" === typeof window) return window
            }
        }()
    })(), (() => {
        r.o = (e, t) => Object.prototype.hasOwnProperty.call(e, t)
    })(), (() => {
        var e = {},
            t = "craft:";
        r.l = (n, o, a, i) => {
            if (e[n]) e[n].push(o);
            else {
                var c, s;
                if (void 0 !== a)
                    for (var u = document.getElementsByTagName("script"), l = 0; l < u.length; l++) {
                        var d = u[l];
                        if (d.getAttribute("src") == n || d.getAttribute("data-webpack") == t + a) {
                            c = d;
                            break
                        }
                    }
                c || (s = !0, c = document.createElement("script"), c.charset = "utf-8", c.timeout = 120, r.nc && c.setAttribute("nonce", r.nc), c.setAttribute("data-webpack", t + a), c.src = n), e[n] = [o];
                var p = (t, r) => {
                        c.onerror = c.onload = null, clearTimeout(f);
                        var o = e[n];
                        if (delete e[n], c.parentNode && c.parentNode.removeChild(c), o && o.forEach((e => e(r))), t) return t(r)
                    },
                    f = setTimeout(p.bind(null, void 0, {
                        type: "timeout",
                        target: c
                    }), 12e4);
                c.onerror = p.bind(null, c.onerror), c.onload = p.bind(null, c.onload), s && document.head.appendChild(c)
            }
        }
    })(), (() => {
        r.r = e => {
            "undefined" !== typeof Symbol && Symbol.toStringTag && Object.defineProperty(e, Symbol.toStringTag, {
                value: "Module"
            }), Object.defineProperty(e, "__esModule", {
                value: !0
            })
        }
    })(), (() => {
        r.p = ""
    })(), (() => {
        var e = {
            143: 0
        };
        r.f.j = (t, n) => {
            var o = r.o(e, t) ? e[t] : void 0;
            if (0 !== o)
                if (o) n.push(o[2]);
                else {
                    var a = new Promise(((r, n) => o = e[t] = [r, n]));
                    n.push(o[2] = a);
                    var i = r.p + r.u(t),
                        c = new Error,
                        s = n => {
                            if (r.o(e, t) && (o = e[t], 0 !== o && (e[t] = void 0), o)) {
                                var a = n && ("load" === n.type ? "missing" : n.type),
                                    i = n && n.target && n.target.src;
                                c.message = "Loading chunk " + t + " failed.\n(" + a + ": " + i + ")", c.name = "ChunkLoadError", c.type = a, c.request = i, o[1](c)
                            }
                        };
                    r.l(i, s, "chunk-" + t, t)
                }
        }, r.O.j = t => 0 === e[t];
        var t = (t, n) => {
                var o, a, [i, c, s] = n,
                    u = 0;
                for (o in c) r.o(c, o) && (r.m[o] = c[o]);
                if (s) var l = s(r);
                for (t && t(n); u < i.length; u++) a = i[u], r.o(e, a) && e[a] && e[a][0](), e[i[u]] = 0;
                return r.O(l)
            },
            n = self["webpackChunkcraft"] = self["webpackChunkcraft"] || [];
        n.forEach(t.bind(null, 0)), n.push = t.bind(null, n.push.bind(n))
    })();
    var n = r.O(void 0, [736], (() => r(216)));
    n = r.O(n)
})();