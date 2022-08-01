(self["webpackChunkcraft"] = self["webpackChunkcraft"] || []).push([
    [372], {
        6372: (e, t, o) => {
            "use strict";
            o.r(t), o.d(t, {
                default: () => U
			});
            var a = o(3673);
			
            function i(e, t, o, i, n, s) {
                const r = (0, a.up)("ViewCarousel"),
				l = (0, a.up)("q-page");
                return (0, a.wg)(), (0, a.j4)(l, {
                    padding: ""
					}, {
                    default: (0, a.w5)((() => [(0, a.Wm)(r)])),
                    _: 1
				})
			}
            var n = o(2323);
			
            function s(e, t, o, i, s, r) {
                const l = (0, a.up)("PerkViewer"),
				h = (0, a.up)("q-carousel-slide"),
				c = (0, a.up)("q-carousel");
                return (0, a.wg)(), (0, a.j4)("div", null, [(0, a.Wm)(c, {
                    modelValue: s.slide,
                    "onUpdate:modelValue": t[1] || (t[1] = e => s.slide = e),
                    "transition-prev": "scale",
                    "transition-next": "scale",
                    dark: "",
                    animated: "",
                    "control-color": "white",
                    navigation: "",
                    arrows: "",
                    height: "1000px"
					}, {
                    default: (0, a.w5)((() => [(0, a.Wm)(h, {
                        name: "slideZero"
						}, {
                        default: (0, a.w5)((() => [(0, a.Wm)("div", null, (0, n.zw)(s.firstSlideTitle), 1), (0, a.Wm)(l, {
                            onSlide: 0
						})])),
                        _: 1
						}), (0, a.Wm)(h, {
                        name: "slideOne"
						}, {
                        default: (0, a.w5)((() => [(0, a.Wm)("div", null, (0, n.zw)(s.secondSlideTitle), 1), (0, a.Wm)(l, {
                            onSlide: 1
						})])),
                        _: 1
					})])),
                    _: 1
				}, 8, ["modelValue"])])
			}
            o(246);
            const r = {
				class: "row"
			},
			l = {
				class: "col-4 q-pa-md"
			},
			h = (0, a.Uk)(" Perks "),
			c = {
				class: "col-8 q-pa-md",
				name: "display"
			},
			u = {
				class: "row"
			};
			
            function d(e, t, o, i, s, d) {
                const m = (0, a.up)("Store"),
				y = (0, a.up)("q-item-label"),
				g = (0, a.up)("q-item-section"),
				p = (0, a.up)("q-item"),
				f = (0, a.up)("Perk"),
				w = (0, a.up)("q-list"),
				b = (0, a.up)("q-scroll-observer"),
				v = (0, a.up)("q-scroll-area"),
				k = (0, a.up)("Gatcha"),
				T = (0, a.up)("q-btn");
                return (0, a.wg)(), (0, a.j4)(a.HY, null, [(0, a.Wm)(m), (0, a.Wm)("div", r, [(0, a.Wm)("div", l, [(0, a.Wm)(v, {
                    style: {
                        height: "900px"
					}
					}, {
                    default: (0, a.w5)((() => [(0, a.Wm)(w, {
                        bordered: "",
                        name: "perkList"
						}, {
                        default: (0, a.w5)((() => [(0, a.Wm)(p, null, {
                            default: (0, a.w5)((() => [(0, a.Wm)(g, null, {
                                default: (0, a.w5)((() => [(0, a.Wm)(y, {
                                    header: "",
                                    dark: ""
									}, {
                                    default: (0, a.w5)((() => [h])),
                                    _: 1
								})])),
                                _: 1
							})])),
                            _: 1
							}), ((0, a.wg)(!0), (0, a.j4)(a.HY, null, (0, a.Ko)(e.perks, (t => ((0, a.wg)(), (0, a.j4)(f, (0, a.dG)({
								key: t.id
								}, t, {
								onClick: o => e.updateDisplay(t)
							}), null, 16, ["onClick"])))), 128))])),
							_: 1
					}), (0, a.Wm)(b)])),
                    _: 1
					})]), (0, a.Wm)("div", c, [(0, a.Wm)(k), (0, a.Wm)("div", u, [(0, a.Wm)(w, null, {
						default: (0, a.w5)((() => [(0, a.Wm)(p, null, {
							default: (0, a.w5)((() => [(0, a.Wm)(g, null, {
								default: (0, a.w5)((() => [(0, a.Wm)(y, {
									header: "",
									dark: ""
									}, {
									default: (0, a.w5)((() => [(0, a.Uk)((0, n.zw)(e.storeState.displayValue.title), 1)])),
									_: 1
								})])),
								_: 1
								}), (0, a.Wm)(g, {
								side: ""
								}, {
								default: (0, a.w5)((() => [(0, a.Wm)(T, {
									dark: "",
									label: "add perk",
									outline: "",
									ripple: "",
									color: "blue-grey-12",
									onClick: t[1] || (t[1] = t => e.addPerk(e.storeState.displayValue))
								})])),
								_: 1
							})])),
							_: 1
							}), (0, a.Wm)(p, null, {
							default: (0, a.w5)((() => [(0, a.Wm)("p", null, " Domain: " + (0, n.zw)(e.storeState.displayValue.domain), 1)])),
							_: 1
							}), (0, a.Wm)(p, null, {
							default: (0, a.w5)((() => [(0, a.Wm)("p", null, "Source Material: " + (0, n.zw)(e.storeState.displayValue.source), 1)])),
							_: 1
							}), (0, a.Wm)(p, null, {
							default: (0, a.w5)((() => [(0, a.Wm)("p", null, " Cost: " + (0, n.zw)(e.storeState.displayValue.cost) + " CP ", 1)])),
							_: 1
							}), (0, a.Wm)(p, null, {
							default: (0, a.w5)((() => [(0, a.Wm)("p", null, " Description: " + (0, n.zw)(e.storeState.displayValue.description), 1)])),
							_: 1
							}), (0, a.Wm)(p, null, {
							default: (0, a.w5)((() => [(0, a.Wm)("p", null, " ID: " + (0, n.zw)(e.storeState.displayValue.id), 1)])),
							_: 1
						})])),
						_: 1
					})])])])], 64)
			}
            var m = o(1959);
			
            function y(e, t, o, i, s, r) {
                const l = (0, a.up)("q-item-label"),
				h = (0, a.up)("q-item-section"),
				c = (0, a.up)("q-item"),
				u = (0, a.Q2)("ripple");
                return (0, a.wg)(), (0, a.j4)("div", null, [(0, a.wy)((0, a.Wm)(c, {
                    clickable: "",
                    dark: ""
					}, {
                    default: (0, a.w5)((() => [(0, a.Wm)(h, null, {
                        default: (0, a.w5)((() => [(0, a.Wm)(l, {
                            lines: "3"
							}, {
                            default: (0, a.w5)((() => [(0, a.Uk)((0, n.zw)(o.title), 1)])),
                            _: 1
							}), (0, a.Wm)(l, {
                            caption: ""
							}, {
                            default: (0, a.w5)((() => [(0, a.Uk)((0, n.zw)(o.domain), 1)])),
                            _: 1
						})])),
                        _: 1
						}), (0, a.Wm)(h, {
                        side: "",
                        top: ""
						}, {
                        default: (0, a.w5)((() => [(0, a.Wm)(l, null, {
                            default: (0, a.w5)((() => [(0, a.Uk)((0, n.zw)(o.id), 1)])),
                            _: 1
						})])),
                        _: 1
					})])),
                    _: 1
				}, 512), [
				[u]
                ])])
			}
            const g = {
                name: "Perk",
                data() {
                    return {}
				},
                props: {
                    title: {
                        type: String,
                        required: !0
					},
                    id: {
                        type: String,
                        required: !0
					},
                    description: {
                        type: String,
                        required: !0
					},
                    cost: {
                        type: Number,
                        required: !0
					},
                    domain: {
                        type: String,
                        required: !0
					}
				},
                setup() {
                    return {}
				}
			};
            var p = o(3414),
			f = o(2035),
			w = o(2350),
			b = o(6489),
			v = o(7518),
			k = o.n(v);
            g.render = y;
            const T = g;
			
            function A(e, t, o, i, n, s) {
                return (0, a.wg)(), (0, a.j4)("div")
			}
            k()(g, "components", {
                QItem: p.Z,
                QItemSection: f.Z,
                QItemLabel: w.Z
				}), k()(g, "directives", {
                Ripple: b.Z
			});
            const S = o(7148),
			C = {
				debug: !0,
				state: (0, m.qj)({
					displayValue: {
						domain: "One of twelve clusters of conceptually similar perks",
						id: "Unique perk reference, format: domain#(.)perk#",
						title: "Selected perk title (currently none)",
						source: "Media property from which perk originates",
						cost: "Perk value in creation points, abbreviated",
						description: "General, functional perk definition"
					},
					unfiltered: S,
					filtered: [],
					build: [],
					searchString: "Tool"
				}),
				setDisplayValue(e) {
					this.debug && console.log("store.setDisplayValue called with", e), this.state.displayValue = e
				},
				clearDisplayValue() {
					this.debug && console.log("store.clearDisplayValue called with", newValue), this.state.displayValue = newValue
				},
				addToBuild(e,doFrees) {
					if(isNull(doFrees)) doFrees = true;
					if(doFree) {
						var frees = doFree(e);
						if(!isNull(frees)) {
							for(var pk of frees) {
								this.state.build.push(pk);
							}
						}
					}
					e.taken = true;
					if(isNull(e.retake_count)) e.retake_count = 0;
					e.retake_count++;
					this.debug && console.log("store.addToBuild called with", e), this.state.build.push(e)
				},
				fetchDisplayList(e) {
				return 0 == e ? this.state.unfiltered : this.state.build
				},
				setSearchString(e) {
					this.state.searchString = e, console.log("Store ", e)
				}
                },
                Y = {
                    name: "store",
                    state: C.state,
                    setDisplay: C.setDisplayValue,
                    clearDisplay: C.clearDisplayValue,
                    addPerk: C.addToBuild,
                    fetchDisplayList: C.fetchDisplayList,
                    setSearchString: C.setSearchString
				};
				Y.render = A;
				const M = Y,
                W = {
                    class: "col-12"
				},
                x = {
                    class: "row"
				},
                _ = {
                    class: "col-12 col-md-2 q-pa-md"
				},
                q = {
                    class: "col-12 col-md-2 q-pa-md"
				},
                P = {
                    class: "col-12 col-md-8 q-pa-md"
				};
				
				function I(e, t, o, i, s, r) {
					const l = (0, a.up)("Store"),
                    h = (0, a.up)("q-btn"),
                    c = (0, a.up)("q-list");
					return (0, a.wg)(), (0, a.j4)(a.HY, null, [(0, a.Wm)(l), (0, a.Wm)("div", W, [(0, a.Wm)(c, {
						bordered: "",
						dark: !0,
						seperator: "",
						padding: "",
						name: "GachaPanel"
						}, {
						default: (0, a.w5)((() => [(0, a.Wm)("div", x, [(0, a.Wm)("div", _, [(0, a.Wm)(h, {
							dark: "",
							label: "Gacha!",
							outline: "",
							ripple: "",
							color: "blue-grey-12",
							onClick: t[1] || (t[1] = t => e.roll(e.cp, e.result))
						})]), (0, a.Wm)("div", q, " CP: " + (0, n.zw)(e.cp), 1), (0, a.Wm)("div", P, (0, n.zw)(e.result), 1)])])),
						_: 1
					})])], 64)
				}
				const F = (0, a.aZ)({
					name: "Gatcha",
					components: {
						Store: M
					},
					setup() {
						const e = (0, m.iH)(0),
                        t = (0, m.iH)("Press Gacha! button for 100 CP and a chance to pull a random perk");
						return {
							cp: e,
							result: t,
							roll() {
								e.value += 100;
								let o = M.state.unfiltered[Math.floor(Math.random() * M.state.unfiltered.length)];
								var canGet = canGet(o);
								var actCost = getActCost(o);
								M.setDisplay(o), (e.value >= o.cost && canGet) ? (t.value = "Perk purchased and added to build", e.value = e.value - o.cost, M.addPerk(o)) : t.value = "Couldn't afford perk, CP stored"
							}
						}
					}
				});
				var E = o(7011),
                j = o(4607);
				F.render = I;
				const B = F;
				k()(F, "components", {
					QList: E.Z,
					QBtn: j.Z
				});
				const z = (0, a.aZ)({
					name: "PerkViewer",
					components: {
						Perk: T,
						Store: M,
						Gatcha: B
					},
					props: {
						onSlide: {
							type: Number,
							required: !0
						}
					},
					setup(e) {
						const {
							onSlide: t
							} = (0, m.BK)(e), o = (0, m.iH)(null), i = async () => {
							o.value = await M.fetchDisplayList(t.value)
						};
						return (0, a.bv)(i), (0, a.YP)(t, i), {
							perks: o,
							updateDisplay(e) {
								M.setDisplay(e)
							},
							addPerk(e) {
								M.addPerk(e)
							},
							displayList: o,
							getDisplayList: i,
							query: M.searchString
						}
					},
					data() {
						return {
							storeState: M.state
						}
					}
				});
				var D = o(7704),
                G = o(4303);
				z.render = d;
				const R = z;
				k()(z, "components", {
					QScrollArea: D.Z,
					QList: E.Z,
					QItem: p.Z,
					QItemSection: f.Z,
					QItemLabel: w.Z,
					QBtn: j.Z,
					QScrollObserver: G.Z
				});
				const O = {
					name: "ViewCarousel",
					data() {
						return {
							slide: "slideZero",
							firstSlideTitle: "Perk Selector",
							secondSlideTitle: "Current Build"
						}
					},
					components: {
						PerkViewer: R
					},
					setup() {
						return {}
					}
				};
				var H = o(7565),
                L = o(4593);
				O.render = s;
				const K = O;
				k()(O, "components", {
					QCarousel: H.Z,
					QCarouselSlide: L.Z
				});
				const N = (0, a.aZ)({
					name: "Builder",
					components: {
						ViewCarousel: K
					}
				});
				var V = o(4379);
				N.render = i;
				const U = N;
				k()(N, "components", {
					QPage: V.Z
				})
		},
        7148: e => {
            "use strict";
			//console.log("starts",starts);
			e.exports = convertForge();
		}
	}
]);
