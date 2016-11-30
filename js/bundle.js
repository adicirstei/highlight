(function (exports) {
'use strict';

var fableGlobal = function () {
    var globalObj = typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : null;
    if (typeof globalObj.__FABLE_CORE__ === "undefined") {
        globalObj.__FABLE_CORE__ = {
            types: new Map(),
            symbols: {
                reflection: Symbol("reflection"),
                generics: Symbol("generics")
            }
        };
    }
    return globalObj.__FABLE_CORE__;
}();
function setType(fullName, cons) {
    fableGlobal.types.set(fullName, cons);
}

var _Symbol = fableGlobal.symbols;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var NonDeclaredType = function () {
    function NonDeclaredType(kind, name, generics) {
        _classCallCheck(this, NonDeclaredType);

        this.kind = kind;
        this.name = name;
        this.generics = generics || [];
    }

    _createClass(NonDeclaredType, [{
        key: "Equals",
        value: function Equals(other) {
            return this.kind === other.kind && this.name === other.name && equals(this.generics, other.generics);
        }
    }]);

    return NonDeclaredType;
}();

var GenericNonDeclaredType = function (_NonDeclaredType) {
    _inherits(GenericNonDeclaredType, _NonDeclaredType);

    function GenericNonDeclaredType(kind, generics) {
        _classCallCheck(this, GenericNonDeclaredType);

        return _possibleConstructorReturn(this, (GenericNonDeclaredType.__proto__ || Object.getPrototypeOf(GenericNonDeclaredType)).call(this, kind, null, generics));
    }

    _createClass(GenericNonDeclaredType, [{
        key: _Symbol.generics,
        value: function value() {
            return this.generics;
        }
    }]);

    return GenericNonDeclaredType;
}(NonDeclaredType);

var Any = new NonDeclaredType("Any");
var Unit = new NonDeclaredType("Unit");


function GenericParam(name) {
    return new NonDeclaredType("GenericParam", name);
}


/**
 * Checks if this a function constructor extending another with generic info.
 */
function isGeneric(typ) {
    return typeof typ === "function" && !!typ.prototype[_Symbol.generics];
}
/**
 * Returns the parent if this is a declared generic type or the argument otherwise.
 * Attention: Unlike .NET this doesn't throw an exception if type is not generic.
*/
function getDefinition(typ) {
    return typeof typ === "function" && typ.prototype[_Symbol.generics] ? Object.getPrototypeOf(typ.prototype).constructor : typ;
}

function hasInterface(obj, interfaceName) {
    if (typeof obj[_Symbol.reflection] === "function") {
        var interfaces = obj[_Symbol.reflection]().interfaces;
        return Array.isArray(interfaces) && interfaces.indexOf(interfaceName) > -1;
    }
    return false;
}

function getRestParams(args, idx) {
    for (var _len = args.length, restArgs = Array(_len > idx ? _len - idx : 0), _key = idx; _key < _len; _key++) {
        restArgs[_key - idx] = args[_key];
    }return restArgs;
}
function toString(o) {
    return o != null && typeof o.ToString == "function" ? o.ToString() : String(o);
}

function equals(x, y) {
    // Optimization if they are referencially equal
    if (x === y) return true;else if (x == null) return y == null;else if (y == null) return false;else if (isGeneric(x) && isGeneric(y)) return getDefinition(x) === getDefinition(y) && equalsRecords(x.prototype[_Symbol.generics](), y.prototype[_Symbol.generics]());else if (Object.getPrototypeOf(x) !== Object.getPrototypeOf(y)) return false;else if (typeof x.Equals === "function") return x.Equals(y);else if (Array.isArray(x)) {
        if (x.length != y.length) return false;
        for (var i = 0; i < x.length; i++) {
            if (!equals(x[i], y[i])) return false;
        }return true;
    } else if (ArrayBuffer.isView(x)) {
        if (x.byteLength !== y.byteLength) return false;
        var dv1 = new DataView(x.buffer),
            dv2 = new DataView(y.buffer);
        for (var _i = 0; _i < x.byteLength; _i++) {
            if (dv1.getUint8(_i) !== dv2.getUint8(_i)) return false;
        }return true;
    } else if (x instanceof Date) return x.getTime() == y.getTime();else return false;
}
function compare(x, y) {
    // Optimization if they are referencially equal
    if (x === y) return 0;
    if (x == null) return y == null ? 0 : -1;else if (y == null) return -1;else if (Object.getPrototypeOf(x) !== Object.getPrototypeOf(y)) return -1;else if (hasInterface(x, "System.IComparable")) return x.CompareTo(y);else if (Array.isArray(x)) {
        if (x.length != y.length) return x.length < y.length ? -1 : 1;
        for (var i = 0, j = 0; i < x.length; i++) {
            if ((j = compare(x[i], y[i])) !== 0) return j;
        }return 0;
    } else if (ArrayBuffer.isView(x)) {
        if (x.byteLength != y.byteLength) return x.byteLength < y.byteLength ? -1 : 1;
        var dv1 = new DataView(x.buffer),
            dv2 = new DataView(y.buffer);
        for (var _i2 = 0, b1 = 0, b2 = 0; _i2 < x.byteLength; _i2++) {
            b1 = dv1.getUint8(_i2), b2 = dv2.getUint8(_i2);
            if (b1 < b2) return -1;
            if (b1 > b2) return 1;
        }
        return 0;
    } else if (x instanceof Date) return compare(x.getTime(), y.getTime());else return x < y ? -1 : 1;
}
function equalsRecords(x, y) {
    // Optimization if they are referencially equal
    if (x === y) {
        return true;
    } else {
        var keys = Object.getOwnPropertyNames(x);
        for (var i = 0; i < keys.length; i++) {
            if (!equals(x[keys[i]], y[keys[i]])) return false;
        }
        return true;
    }
}

function equalsUnions(x, y) {
    // Optimization if they are referencially equal
    if (x === y) {
        return true;
    } else if (x.Case !== y.Case) {
        return false;
    } else {
        for (var i = 0; i < x.Fields.length; i++) {
            if (!equals(x.Fields[i], y.Fields[i])) return false;
        }
        return true;
    }
}
function compareUnions(x, y) {
    // Optimization if they are referencially equal
    if (x === y) {
        return 0;
    } else {
        var res = compare(x.Case, y.Case);
        if (res !== 0) return res;
        for (var i = 0; i < x.Fields.length; i++) {
            res = compare(x.Fields[i], y.Fields[i]);
            if (res !== 0) return res;
        }
        return 0;
    }
}

function create(pattern, options) {
    var flags = "g";
    flags += options & 1 ? "i" : "";
    flags += options & 2 ? "m" : "";
    return new RegExp(pattern, flags);
}
// From http://stackoverflow.com/questions/3446170/escape-string-for-use-in-javascript-regex
function escape(str) {
    return str.replace(/[\-\[\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
}



function matches(str, pattern) {
    var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;

    var reg = str instanceof RegExp ? (reg = str, str = pattern, reg.lastIndex = options, reg) : reg = create(pattern, options);
    if (!reg.global) throw new Error("Non-global RegExp"); // Prevent infinite loop
    var m = void 0;
    var matches = [];
    while ((m = reg.exec(str)) !== null) {
        matches.push(m);
    }return matches;
}

function fromTicks(ticks) {
    return ticks / 10000;
}

function __getValue(d, key) {
    return d[(d.kind == 1 /* UTC */ ? "getUTC" : "get") + key]();
}




function create$1(year, month, day) /* Local */{
    var h = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0;
    var m = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : 0;
    var s = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : 0;
    var ms = arguments.length > 6 && arguments[6] !== undefined ? arguments[6] : 0;
    var kind = arguments.length > 7 && arguments[7] !== undefined ? arguments[7] : 2;

    var date = kind === 1 /* UTC */ ? new Date(Date.UTC(year, month - 1, day, h, m, s, ms)) : new Date(year, month - 1, day, h, m, s, ms);
    if (isNaN(date.getTime())) throw new Error("The parameters describe an unrepresentable Date.");
    date.kind = kind;
    return date;
}



function isLeapYear(year) {
    return year % 4 == 0 && year % 100 != 0 || year % 400 == 0;
}
function daysInMonth(year, month) {
    return month == 2 ? isLeapYear(year) ? 29 : 28 : month >= 8 ? month % 2 == 0 ? 31 : 30 : month % 2 == 0 ? 30 : 31;
}




function day(d) {
    return __getValue(d, "Date");
}
function hour(d) {
    return __getValue(d, "Hours");
}
function millisecond(d) {
    return __getValue(d, "Milliseconds");
}
function minute(d) {
    return __getValue(d, "Minutes");
}
function month(d) {
    return __getValue(d, "Month") + 1;
}
function second(d) {
    return __getValue(d, "Seconds");
}
function year(d) {
    return __getValue(d, "FullYear");
}

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var fsFormatRegExp = /(^|[^%])%([0+ ]*)(-?\d+)?(?:\.(\d+))?(\w)/;
var formatRegExp = /\{(\d+)(,-?\d+)?(?:\:(.+?))?\}/g;
function fsFormat(str) {
    var _cont = void 0;
    function isObject(x) {
        return x !== null && (typeof x === "undefined" ? "undefined" : _typeof(x)) === "object" && !(x instanceof Number) && !(x instanceof String) && !(x instanceof Boolean);
    }
    function formatOnce(str, rep) {
        return str.replace(fsFormatRegExp, function (_, prefix, flags, pad, precision, format) {
            switch (format) {
                case "f":
                case "F":
                    rep = rep.toFixed(precision || 6);
                    break;
                case "g":
                case "G":
                    rep = rep.toPrecision(precision);
                    break;
                case "e":
                case "E":
                    rep = rep.toExponential(precision);
                    break;
                case "O":
                    rep = toString(rep);
                    break;
                case "A":
                    try {
                        rep = JSON.stringify(rep, function (k, v) {
                            return v && v[Symbol.iterator] && !Array.isArray(v) && isObject(v) ? Array.from(v) : v;
                        });
                    } catch (err) {
                        // Fallback for objects with circular references
                        rep = "{" + Object.getOwnPropertyNames(rep).map(function (k) {
                            return k + ": " + String(rep[k]);
                        }).join(", ") + "}";
                    }
                    break;
            }
            var plusPrefix = flags.indexOf("+") >= 0 && parseInt(rep) >= 0;
            if (!isNaN(pad = parseInt(pad))) {
                var ch = pad >= 0 && flags.indexOf("0") >= 0 ? "0" : " ";
                rep = padLeft(rep, Math.abs(pad) - (plusPrefix ? 1 : 0), ch, pad < 0);
            }
            var once = prefix + (plusPrefix ? "+" + rep : rep);
            return once.replace(/%/g, "%%");
        });
    }
    function makeFn(str) {
        return function (rep) {
            var str2 = formatOnce(str, rep);
            return fsFormatRegExp.test(str2) ? makeFn(str2) : _cont(str2.replace(/%%/g, "%"));
        };
    }

    for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        args[_key - 1] = arguments[_key];
    }

    if (args.length === 0) {
        return function (cont) {
            _cont = cont;
            return fsFormatRegExp.test(str) ? makeFn(str) : _cont(str);
        };
    } else {
        for (var i = 0; i < args.length; i++) {
            str = formatOnce(str, args[i]);
        }
        return str.replace(/%%/g, "%");
    }
}




function isNullOrEmpty(str) {
    return typeof str !== "string" || str.length == 0;
}



function padLeft(str, len, ch, isRight) {
    ch = ch || " ";
    str = String(str);
    len = len - str.length;
    for (var i = -1; ++i < len;) {
        str = isRight ? str + ch : ch + str;
    }return str;
}

var _createClass$1 = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck$1(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// This module is split from List.ts to prevent cyclic dependencies
function ofArray$1(args, base) {
    var acc = base || new List();
    for (var i = args.length - 1; i >= 0; i--) {
        acc = new List(args[i], acc);
    }
    return acc;
}

var List = function () {
    function List(head, tail) {
        _classCallCheck$1(this, List);

        this.head = head;
        this.tail = tail;
    }

    _createClass$1(List, [{
        key: "ToString",
        value: function ToString() {
            return "[" + Array.from(this).map(toString).join("; ") + "]";
        }
    }, {
        key: "Equals",
        value: function Equals(x) {
            // Optimization if they are referencially equal
            if (this === x) {
                return true;
            } else {
                var iter1 = this[Symbol.iterator](),
                    iter2 = x[Symbol.iterator]();
                for (;;) {
                    var cur1 = iter1.next(),
                        cur2 = iter2.next();
                    if (cur1.done) return cur2.done ? true : false;else if (cur2.done) return false;else if (!equals(cur1.value, cur2.value)) return false;
                }
            }
        }
    }, {
        key: "CompareTo",
        value: function CompareTo(x) {
            // Optimization if they are referencially equal
            if (this === x) {
                return 0;
            } else {
                var acc = 0;
                var iter1 = this[Symbol.iterator](),
                    iter2 = x[Symbol.iterator]();
                for (;;) {
                    var cur1 = iter1.next(),
                        cur2 = iter2.next();
                    if (cur1.done) return cur2.done ? acc : -1;else if (cur2.done) return 1;else {
                        acc = compare(cur1.value, cur2.value);
                        if (acc != 0) return acc;
                    }
                }
            }
        }
    }, {
        key: Symbol.iterator,
        value: function value() {
            var cur = this;
            return {
                next: function next() {
                    var tmp = cur;
                    cur = cur.tail;
                    return { done: tmp.tail == null, value: tmp.head };
                }
            };
        }
        //   append(ys: List<T>): List<T> {
        //     return append(this, ys);
        //   }
        //   choose<U>(f: (x: T) => U, xs: List<T>): List<U> {
        //     return choose(f, this);
        //   }
        //   collect<U>(f: (x: T) => List<U>): List<U> {
        //     return collect(f, this);
        //   }
        //   filter(f: (x: T) => boolean): List<T> {
        //     return filter(f, this);
        //   }
        //   where(f: (x: T) => boolean): List<T> {
        //     return filter(f, this);
        //   }
        //   map<U>(f: (x: T) => U): List<U> {
        //     return map(f, this);
        //   }
        //   mapIndexed<U>(f: (i: number, x: T) => U): List<U> {
        //     return mapIndexed(f, this);
        //   }
        //   partition(f: (x: T) => boolean): [List<T>, List<T>] {
        //     return partition(f, this) as [List<T>, List<T>];
        //   }
        //   reverse(): List<T> {
        //     return reverse(this);
        //   }
        //   slice(lower: number, upper: number): List<T> {
        //     return slice(lower, upper, this);
        //   }

    }, {
        key: _Symbol.reflection,
        value: function value() {
            return {
                type: "Microsoft.FSharp.Collections.FSharpList",
                interfaces: ["System.IEquatable", "System.IComparable"]
            };
        }
    }, {
        key: "length",
        get: function get() {
            var cur = this,
                acc = 0;
            while (cur.tail != null) {
                cur = cur.tail;
                acc++;
            }
            return acc;
        }
    }]);

    return List;
}();

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

function _defineProperty$1(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function toList(xs) {
    return foldBack(function (x, acc) {
        return new List(x, acc);
    }, xs, new List());
}








function compareWith(f, xs, ys) {
    var nonZero = tryFind(function (i) {
        return i != 0;
    }, map2(function (x, y) {
        return f(x, y);
    }, xs, ys));
    return nonZero != null ? nonZero : count(xs) - count(ys);
}
function delay(f) {
    return _defineProperty$1({}, Symbol.iterator, function () {
        return f()[Symbol.iterator]();
    });
}










function fold(f, acc, xs) {
    if (Array.isArray(xs) || ArrayBuffer.isView(xs)) {
        return xs.reduce(f, acc);
    } else {
        var cur = void 0;
        for (var i = 0, iter = xs[Symbol.iterator]();; i++) {
            cur = iter.next();
            if (cur.done) break;
            acc = f(acc, cur.value, i);
        }
        return acc;
    }
}
function foldBack(f, xs, acc) {
    var arr = Array.isArray(xs) || ArrayBuffer.isView(xs) ? xs : Array.from(xs);
    for (var i = arr.length - 1; i >= 0; i--) {
        acc = f(arr[i], acc, i);
    }
    return acc;
}

















// A export function 'length' method causes problems in JavaScript -- https://github.com/Microsoft/TypeScript/issues/442
function count(xs) {
    return Array.isArray(xs) || ArrayBuffer.isView(xs) ? xs.length : fold(function (acc, x) {
        return acc + 1;
    }, 0, xs);
}
function map(f, xs) {
    return delay(function () {
        return unfold(function (iter) {
            var cur = iter.next();
            return !cur.done ? [f(cur.value), iter] : null;
        }, xs[Symbol.iterator]());
    });
}

function map2(f, xs, ys) {
    return delay(function () {
        var iter1 = xs[Symbol.iterator]();
        var iter2 = ys[Symbol.iterator]();
        return unfold(function () {
            var cur1 = iter1.next(),
                cur2 = iter2.next();
            return !cur1.done && !cur2.done ? [f(cur1.value, cur2.value), null] : null;
        });
    });
}










function rangeStep(first, step, last) {
    if (step === 0) throw new Error("Step cannot be 0");
    return delay(function () {
        return unfold(function (x) {
            return step > 0 && x <= last || step < 0 && x >= last ? [x, x + step] : null;
        }, first);
    });
}
function rangeChar(first, last) {
    return delay(function () {
        return unfold(function (x) {
            return x <= last ? [x, String.fromCharCode(x.charCodeAt(0) + 1)] : null;
        }, first);
    });
}
function range(first, last) {
    return rangeStep(first, 1, last);
}

function reduce(f, xs) {
    if (Array.isArray(xs) || ArrayBuffer.isView(xs)) return xs.reduce(f);
    var iter = xs[Symbol.iterator]();
    var cur = iter.next();
    if (cur.done) throw new Error("Seq was empty");
    var acc = cur.value;
    for (;;) {
        cur = iter.next();
        if (cur.done) break;
        acc = f(acc, cur.value);
    }
    return acc;
}















function tryFind(f, xs, defaultValue) {
    for (var i = 0, iter = xs[Symbol.iterator]();; i++) {
        var cur = iter.next();
        if (cur.done) return defaultValue === void 0 ? null : defaultValue;
        if (f(cur.value, i)) return cur.value;
    }
}









function unfold(f, acc) {
    return _defineProperty$1({}, Symbol.iterator, function () {
        return {
            next: function next() {
                var res = f(acc);
                if (res != null) {
                    acc = res[1];
                    return { done: false, value: res[0] };
                }
                return { done: true };
            }
        };
    });
}

var _createClass$3 = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck$3(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var GenericComparer = function () {
    function GenericComparer(f) {
        _classCallCheck$3(this, GenericComparer);

        this.Compare = f || compare;
    }

    _createClass$3(GenericComparer, [{
        key: _Symbol.reflection,
        value: function value() {
            return { interfaces: ["System.IComparer"] };
        }
    }]);

    return GenericComparer;
}();

var _createClass$2 = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck$2(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// ----------------------------------------------
// These functions belong to Seq.ts but are
// implemented here to prevent cyclic dependencies


var MapTree = function MapTree(caseName, fields) {
    _classCallCheck$2(this, MapTree);

    this.Case = caseName;
    this.Fields = fields;
};
function tree_sizeAux(acc, m) {
    return m.Case === "MapOne" ? acc + 1 : m.Case === "MapNode" ? tree_sizeAux(tree_sizeAux(acc + 1, m.Fields[2]), m.Fields[3]) : acc;
}
function tree_size(x) {
    return tree_sizeAux(0, x);
}
function tree_empty() {
    return new MapTree("MapEmpty", []);
}
function tree_height(_arg1) {
    return _arg1.Case === "MapOne" ? 1 : _arg1.Case === "MapNode" ? _arg1.Fields[4] : 0;
}
function tree_mk(l, k, v, r) {
    var matchValue = [l, r];
    var $target1 = function $target1() {
        var hl = tree_height(l);
        var hr = tree_height(r);
        var m = hl < hr ? hr : hl;
        return new MapTree("MapNode", [k, v, l, r, m + 1]);
    };
    if (matchValue[0].Case === "MapEmpty") {
        if (matchValue[1].Case === "MapEmpty") {
            return new MapTree("MapOne", [k, v]);
        } else {
            return $target1();
        }
    } else {
        return $target1();
    }
}

function tree_rebalance(t1, k, v, t2) {
    var t1h = tree_height(t1);
    var t2h = tree_height(t2);
    if (t2h > t1h + 2) {
        if (t2.Case === "MapNode") {
            if (tree_height(t2.Fields[2]) > t1h + 1) {
                if (t2.Fields[2].Case === "MapNode") {
                    return tree_mk(tree_mk(t1, k, v, t2.Fields[2].Fields[2]), t2.Fields[2].Fields[0], t2.Fields[2].Fields[1], tree_mk(t2.Fields[2].Fields[3], t2.Fields[0], t2.Fields[1], t2.Fields[3]));
                } else {
                    throw new Error("rebalance");
                }
            } else {
                return tree_mk(tree_mk(t1, k, v, t2.Fields[2]), t2.Fields[0], t2.Fields[1], t2.Fields[3]);
            }
        } else {
            throw new Error("rebalance");
        }
    } else {
        if (t1h > t2h + 2) {
            if (t1.Case === "MapNode") {
                if (tree_height(t1.Fields[3]) > t2h + 1) {
                    if (t1.Fields[3].Case === "MapNode") {
                        return tree_mk(tree_mk(t1.Fields[2], t1.Fields[0], t1.Fields[1], t1.Fields[3].Fields[2]), t1.Fields[3].Fields[0], t1.Fields[3].Fields[1], tree_mk(t1.Fields[3].Fields[3], k, v, t2));
                    } else {
                        throw new Error("rebalance");
                    }
                } else {
                    return tree_mk(t1.Fields[2], t1.Fields[0], t1.Fields[1], tree_mk(t1.Fields[3], k, v, t2));
                }
            } else {
                throw new Error("rebalance");
            }
        } else {
            return tree_mk(t1, k, v, t2);
        }
    }
}
function tree_add(comparer, k, v, m) {
    if (m.Case === "MapOne") {
        var c = comparer.Compare(k, m.Fields[0]);
        if (c < 0) {
            return new MapTree("MapNode", [k, v, new MapTree("MapEmpty", []), m, 2]);
        } else if (c === 0) {
            return new MapTree("MapOne", [k, v]);
        }
        return new MapTree("MapNode", [k, v, m, new MapTree("MapEmpty", []), 2]);
    } else if (m.Case === "MapNode") {
        var c = comparer.Compare(k, m.Fields[0]);
        if (c < 0) {
            return tree_rebalance(tree_add(comparer, k, v, m.Fields[2]), m.Fields[0], m.Fields[1], m.Fields[3]);
        } else if (c === 0) {
            return new MapTree("MapNode", [k, v, m.Fields[2], m.Fields[3], m.Fields[4]]);
        }
        return tree_rebalance(m.Fields[2], m.Fields[0], m.Fields[1], tree_add(comparer, k, v, m.Fields[3]));
    }
    return new MapTree("MapOne", [k, v]);
}
function tree_find(comparer, k, m) {
    var res = tree_tryFind(comparer, k, m);
    if (res != null) return res;
    throw new Error("key not found");
}
function tree_tryFind(comparer, k, m) {
    if (m.Case === "MapOne") {
        var c = comparer.Compare(k, m.Fields[0]);
        return c === 0 ? m.Fields[1] : null;
    } else if (m.Case === "MapNode") {
        var c = comparer.Compare(k, m.Fields[0]);
        if (c < 0) {
            return tree_tryFind(comparer, k, m.Fields[2]);
        } else {
            if (c === 0) {
                return m.Fields[1];
            } else {
                return tree_tryFind(comparer, k, m.Fields[3]);
            }
        }
    }
    return null;
}
function tree_mem(comparer, k, m) {
    return m.Case === "MapOne" ? comparer.Compare(k, m.Fields[0]) === 0 : m.Case === "MapNode" ? function () {
        var c = comparer.Compare(k, m.Fields[0]);
        if (c < 0) {
            return tree_mem(comparer, k, m.Fields[2]);
        } else {
            if (c === 0) {
                return true;
            } else {
                return tree_mem(comparer, k, m.Fields[3]);
            }
        }
    }() : false;
}
// function tree_foldFromTo(comparer: IComparer<any>, lo: any, hi: any, f: (k:any, v:any, acc: any) => any, m: MapTree, x: any): any {
//   if (m.Case === "MapOne") {
//     var cLoKey = comparer.Compare(lo, m.Fields[0]);
//     var cKeyHi = comparer.Compare(m.Fields[0], hi);
//     var x_1 = (cLoKey <= 0 ? cKeyHi <= 0 : false) ? f(m.Fields[0], m.Fields[1], x) : x;
//     return x_1;
//   }
//   else if (m.Case === "MapNode") {
//     var cLoKey = comparer.Compare(lo, m.Fields[0]);
//     var cKeyHi = comparer.Compare(m.Fields[0], hi);
//     var x_1 = cLoKey < 0 ? tree_foldFromTo(comparer, lo, hi, f, m.Fields[2], x) : x;
//     var x_2 = (cLoKey <= 0 ? cKeyHi <= 0 : false) ? f(m.Fields[0], m.Fields[1], x_1) : x_1;
//     var x_3 = cKeyHi < 0 ? tree_foldFromTo(comparer, lo, hi, f, m.Fields[3], x_2) : x_2;
//     return x_3;
//   }
//   return x;
// }
// function tree_foldSection(comparer: IComparer<any>, lo: any, hi: any, f: (k:any, v:any, acc: any) => any, m: MapTree, x: any) {
//   return comparer.Compare(lo, hi) === 1 ? x : tree_foldFromTo(comparer, lo, hi, f, m, x);
// }
// function tree_loop(m: MapTree, acc: any): List<[any,any]> {
//   return m.Case === "MapOne"
//     ? new List([m.Fields[0], m.Fields[1]], acc)
//     : m.Case === "MapNode"
//       ? tree_loop(m.Fields[2], new List([m.Fields[0], m.Fields[1]], tree_loop(m.Fields[3], acc)))
//       : acc;
// }
// function tree_toList(m: MapTree) {
//   return tree_loop(m, new List());
// }
// function tree_toArray(m: MapTree) {
//   return Array.from(tree_toList(m));
// }
// function tree_ofList(comparer: IComparer<any>, l: List<[any,any]>) {
//   return Seq.fold((acc: MapTree, tupledArg: [any, any]) => {
//     return tree_add(comparer, tupledArg[0], tupledArg[1], acc);
//   }, tree_empty(), l);
// }
function tree_mkFromEnumerator(comparer, acc, e) {
    var cur = e.next();
    while (!cur.done) {
        acc = tree_add(comparer, cur.value[0], cur.value[1], acc);
        cur = e.next();
    }
    return acc;
}
// function tree_ofArray(comparer: IComparer<any>, arr: ArrayLike<[any,any]>) {
//   var res = tree_empty();
//   for (var i = 0; i <= arr.length - 1; i++) {
//     res = tree_add(comparer, arr[i][0], arr[i][1], res);
//   }
//   return res;
// }
function tree_ofSeq(comparer, c) {
    var ie = c[Symbol.iterator]();
    return tree_mkFromEnumerator(comparer, tree_empty(), ie);
}
// function tree_copyToArray(s: MapTree, arr: ArrayLike<any>, i: number) {
//   tree_iter((x, y) => { arr[i++] = [x, y]; }, s);
// }
function tree_collapseLHS(stack) {
    if (stack.tail != null) {
        if (stack.head.Case === "MapOne") {
            return stack;
        } else if (stack.head.Case === "MapNode") {
            return tree_collapseLHS(ofArray$1([stack.head.Fields[2], new MapTree("MapOne", [stack.head.Fields[0], stack.head.Fields[1]]), stack.head.Fields[3]], stack.tail));
        } else {
            return tree_collapseLHS(stack.tail);
        }
    } else {
        return new List();
    }
}
function tree_mkIterator(s) {
    return { stack: tree_collapseLHS(new List(s, new List())), started: false };
}
function tree_moveNext(i) {
    function current(i) {
        if (i.stack.tail == null) {
            return null;
        } else if (i.stack.head.Case === "MapOne") {
            return [i.stack.head.Fields[0], i.stack.head.Fields[1]];
        }
        throw new Error("Please report error: Map iterator, unexpected stack for current");
    }
    if (i.started) {
        if (i.stack.tail == null) {
            return { done: true, value: null };
        } else {
            if (i.stack.head.Case === "MapOne") {
                i.stack = tree_collapseLHS(i.stack.tail);
                return {
                    done: i.stack.tail == null,
                    value: current(i)
                };
            } else {
                throw new Error("Please report error: Map iterator, unexpected stack for moveNext");
            }
        }
    } else {
        i.started = true;
        return {
            done: i.stack.tail == null,
            value: current(i)
        };
    }
    
}

var FMap = function () {
    /** Do not call, use Map.create instead. */
    function FMap() {
        _classCallCheck$2(this, FMap);
    }

    _createClass$2(FMap, [{
        key: "ToString",
        value: function ToString() {
            return "map [" + Array.from(this).map(toString).join("; ") + "]";
        }
    }, {
        key: "Equals",
        value: function Equals(m2) {
            return this.CompareTo(m2) === 0;
        }
    }, {
        key: "CompareTo",
        value: function CompareTo(m2) {
            var _this = this;

            return this === m2 ? 0 : compareWith(function (kvp1, kvp2) {
                var c = _this.comparer.Compare(kvp1[0], kvp2[0]);
                return c !== 0 ? c : compare(kvp1[1], kvp2[1]);
            }, this, m2);
        }
    }, {
        key: Symbol.iterator,
        value: function value() {
            var i = tree_mkIterator(this.tree);
            return {
                next: function next() {
                    return tree_moveNext(i);
                }
            };
        }
    }, {
        key: "entries",
        value: function entries() {
            return this[Symbol.iterator]();
        }
    }, {
        key: "keys",
        value: function keys() {
            return map(function (kv) {
                return kv[0];
            }, this);
        }
    }, {
        key: "values",
        value: function values() {
            return map(function (kv) {
                return kv[1];
            }, this);
        }
    }, {
        key: "get",
        value: function get(k) {
            return tree_find(this.comparer, k, this.tree);
        }
    }, {
        key: "has",
        value: function has(k) {
            return tree_mem(this.comparer, k, this.tree);
        }
        /** Not supported */

    }, {
        key: "set",
        value: function set(k, v) {
            throw new Error("not supported");
        }
        /** Not supported */

    }, {
        key: "delete",
        value: function _delete(k) {
            throw new Error("not supported");
        }
        /** Not supported */

    }, {
        key: "clear",
        value: function clear() {
            throw new Error("not supported");
        }
    }, {
        key: _Symbol.reflection,
        value: function value() {
            return {
                type: "Microsoft.FSharp.Collections.FSharpMap",
                interfaces: ["System.IEquatable", "System.IComparable"]
            };
        }
    }, {
        key: "size",
        get: function get() {
            return tree_size(this.tree);
        }
    }]);

    return FMap;
}();

function from(comparer, tree) {
    var map$$1 = new FMap();
    map$$1.tree = tree;
    map$$1.comparer = comparer || new GenericComparer();
    return map$$1;
}
function create$3(ie, comparer) {
    comparer = comparer || new GenericComparer();
    return from(comparer, ie ? tree_ofSeq(comparer, ie) : tree_empty());
}
function add$2(k, v, map$$1) {
    return from(map$$1.comparer, tree_add(map$$1.comparer, k, v, map$$1.tree));
}





function tryFind$1(k, map$$1) {
    return tree_tryFind(map$$1.comparer, k, map$$1.tree);
}

function append$1(xs, ys) {
    return fold(function (acc, x) {
        return new List(x, acc);
    }, ys, reverse$1(xs));
}


// TODO: should be xs: Iterable<List<T>>




function map$1(f, xs) {
    return reverse$1(fold(function (acc, x) {
        return new List(f(x), acc);
    }, new List(), xs));
}



function reverse$1(xs) {
    return fold(function (acc, x) {
        return new List(x, acc);
    }, new List(), xs);
}


/* ToDo: instance unzip() */

/* ToDo: instance unzip3() */

var _createClass$5 = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck$5(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Result = function () {
  function Result(caseName, fields) {
    _classCallCheck$5(this, Result);

    this.Case = caseName;
    this.Fields = fields;
  }

  _createClass$5(Result, [{
    key: _Symbol.reflection,
    value: function value() {
      return {
        type: "Parser.Result",
        interfaces: ["FSharpUnion", "System.IEquatable", "System.IComparable"],
        cases: {
          Failure: ["string"],
          Success: [GenericParam("a")]
        }
      };
    }
  }, {
    key: "Equals",
    value: function Equals(other) {
      return equalsUnions(this, other);
    }
  }, {
    key: "CompareTo",
    value: function CompareTo(other) {
      return compareUnions(this, other);
    }
  }]);

  return Result;
}();
setType("Parser.Result", Result);
var Parser = function () {
  function Parser(caseName, fields) {
    _classCallCheck$5(this, Parser);

    this.Case = caseName;
    this.Fields = fields;
  }

  _createClass$5(Parser, [{
    key: _Symbol.reflection,
    value: function value() {
      return {
        type: "Parser.Parser",
        interfaces: ["FSharpUnion"],
        cases: {
          Parser: ["function"]
        }
      };
    }
  }]);

  return Parser;
}();
setType("Parser.Parser", Parser);
function satisfy(pred) {
  var innerFn = function innerFn(str) {
    return isNullOrEmpty(str) ? new Result("Failure", ["No more input"]) : function () {
      var first = str[0];

      if (pred(first)) {
        var remaining = str.slice(1, str.length);
        return new Result("Success", [[first, remaining]]);
      } else {
        var msg = fsFormat("Unexpected '%c'.")(function (x) {
          return x;
        })(first);
        return new Result("Failure", [msg]);
      }
    }();
  };

  return new Parser("Parser", [innerFn]);
}
function pchar(charToMatch) {
  var innerFn = function innerFn(str) {
    return isNullOrEmpty(str) ? new Result("Failure", ["No more input"]) : function () {
      var first = str[0];

      if (first === charToMatch) {
        var remaining = str.slice(1, str.length);
        return new Result("Success", [[charToMatch, remaining]]);
      } else {
        var msg = fsFormat("Expecting '%c'. Got '%c'")(function (x) {
          return x;
        })(charToMatch)(first);
        return new Result("Failure", [msg]);
      }
    }();
  };

  return new Parser("Parser", [innerFn]);
}
function run(_arg1, input) {
  return _arg1.Fields[0](input);
}
function andThen(p1, p2) {
  var innerFn = function innerFn(str) {
    var r1 = run(p1, str);

    if (r1.Case === "Success") {
      var v1 = r1.Fields[0][0];
      var rest1 = r1.Fields[0][1];
      var r2 = run(p2, rest1);

      if (r2.Case === "Success") {
        var v2 = r2.Fields[0][0];
        var rest2 = r2.Fields[0][1];
        return new Result("Success", [[[v1, v2], rest2]]);
      } else {
        return new Result("Failure", [r2.Fields[0]]);
      }
    } else {
      return new Result("Failure", [r1.Fields[0]]);
    }
  };

  return new Parser("Parser", [innerFn]);
}
function op_DotGreaterGreaterDot() {
  return function (p1) {
    return function (p2) {
      return andThen(p1, p2);
    };
  };
}
function orElse(p1, p2) {
  var innerFn = function innerFn(str) {
    var r1 = run(p1, str);

    if (r1.Case === "Success") {
      return r1;
    } else {
      return run(p2, str);
    }
  };

  return new Parser("Parser", [innerFn]);
}
function op_LessBarGreater() {
  return function (p1) {
    return function (p2) {
      return orElse(p1, p2);
    };
  };
}
function choice(listOfParsers) {
  return reduce(function ($var1, $var2) {
    return op_LessBarGreater()($var1)($var2);
  }, listOfParsers);
}
function anyOf(listOfChars) {
  return choice(function (list) {
    return map$1(function (charToMatch) {
      return pchar(charToMatch);
    }, list);
  }(listOfChars));
}
function mapP(fn, p) {
  var innerFn = function innerFn(str) {
    var matchValue = run(p, str);

    if (matchValue.Case === "Failure") {
      return new Result("Failure", [matchValue.Fields[0]]);
    } else {
      var v = matchValue.Fields[0][0];
      var rest = matchValue.Fields[0][1];
      return new Result("Success", [[fn(v), rest]]);
    }
  };

  return new Parser("Parser", [innerFn]);
}

function op_BarGreaterGreater(x, f) {
  return mapP(f, x);
}
function returnP(v) {
  var innerFn = function innerFn(input) {
    return new Result("Success", [[v, input]]);
  };

  return new Parser("Parser", [innerFn]);
}
function applyP(fP, xP) {
  return mapP(function (tupledArg) {
    return tupledArg[0](tupledArg[1]);
  }, op_DotGreaterGreaterDot()(fP)(xP));
}
function op_LessMultiplyGreater() {
  return function (fP) {
    return function (xP) {
      return applyP(fP, xP);
    };
  };
}
function lift2(f, xP, yP) {
  return op_LessMultiplyGreater()(op_LessMultiplyGreater()(returnP(f))(xP))(yP);
}
function sequence(parserList) {
  var cons = function cons(head$$1) {
    return function (tail$$1) {
      return new List(head$$1, tail$$1);
    };
  };

  var consP = function () {
    var f = cons;
    return function (xP) {
      return function (yP) {
        return lift2(f, xP, yP);
      };
    };
  }();

  if (parserList.tail != null) {
    return consP(parserList.head)(sequence(parserList.tail));
  } else {
    return returnP(new List());
  }
}
function charListToStr(charList) {
  return Array.from(charList).join('');
}
function pstring(str) {
  return function (p) {
    return mapP(function (charList) {
      return charListToStr(charList);
    }, p);
  }(sequence(toList(function (source) {
    return map(function (charToMatch) {
      return pchar(charToMatch);
    }, source);
  }(str))));
}
function parseZeroOrMore(parser, input) {
  var firstResult = run(parser, input);

  if (firstResult.Case === "Success") {
    var inputAfterFirstParse = firstResult.Fields[0][1];
    var firstValue = firstResult.Fields[0][0];
    var patternInput = parseZeroOrMore(parser, inputAfterFirstParse);
    var values = new List(firstValue, patternInput[0]);
    return [values, patternInput[1]];
  } else {
    return [new List(), input];
  }
}
function many(parser) {
  var innerFn = function innerFn(input) {
    return new Result("Success", [parseZeroOrMore(parser, input)]);
  };

  return new Parser("Parser", [innerFn]);
}
function many1(parser) {
  var innerFn = function innerFn(input) {
    var firstResult = run(parser, input);

    if (firstResult.Case === "Success") {
      var inputAfterFirstParse = firstResult.Fields[0][1];
      var firstValue = firstResult.Fields[0][0];
      var patternInput = parseZeroOrMore(parser, inputAfterFirstParse);
      var values = new List(firstValue, patternInput[0]);
      return new Result("Success", [[values, patternInput[1]]]);
    } else {
      return new Result("Failure", [firstResult.Fields[0]]);
    }
  };

  return new Parser("Parser", [innerFn]);
}
function opt(p) {
  var some = op_BarGreaterGreater(p, function (arg0) {
    return arg0;
  });
  var none = returnP();
  return op_LessBarGreater()(some)(none);
}

function op_GreaterGreaterDot(p1, p2) {
  return mapP(function (tupledArg) {
    return tupledArg[1];
  }, op_DotGreaterGreaterDot()(p1)(p2));
}
var pint = function () {
  var resultToInt = function resultToInt(tupledArg) {
    var i = Number.parseInt(Array.from(tupledArg[1]).join(''));

    if (tupledArg[0] == null) {
      return i;
    } else {
      return -i;
    }
  };

  var digit = anyOf(toList(rangeChar("0", "9")));
  var digits = many1(digit);
  return mapP(resultToInt, op_DotGreaterGreaterDot()(opt(pchar("-")))(digits));
}();
function op_GreaterGreaterPercent(p, x) {
  return op_BarGreaterGreater(p, function (_arg1) {
    return x;
  });
}
function manyChars(cp) {
  return op_BarGreaterGreater(many(cp), function (charList) {
    return charListToStr(charList);
  });
}
function manyChars1(cp) {
  return op_BarGreaterGreater(many1(cp), function (charList) {
    return charListToStr(charList);
  });
}
function notP(p1, p2) {
  var innerFn = function innerFn(str) {
    var r = run(p1, str);

    if (r.Case === "Failure") {
      return run(p2, str);
    } else {
      return new Result("Failure", ["Unexpected input"]);
    }
  };

  return new Parser("Parser", [innerFn]);
}
var whitespaceChar = anyOf(ofArray$1([" ", "\t", "\n"]));
var whitespace = many(whitespaceChar);

var _createClass$4 = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck$4(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Token = function () {
  function Token(caseName, fields) {
    _classCallCheck$4(this, Token);

    this.Case = caseName;
    this.Fields = fields;
  }

  _createClass$4(Token, [{
    key: _Symbol.reflection,
    value: function value() {
      return {
        type: "Lexer.Token",
        interfaces: ["FSharpUnion", "System.IEquatable", "System.IComparable"],
        cases: {
          Comment: ["string"],
          Keyword: ["string"],
          Operator: ["string"],
          String: ["string"],
          Text: ["string"],
          Value: ["string"]
        }
      };
    }
  }, {
    key: "Equals",
    value: function Equals(other) {
      return equalsUnions(this, other);
    }
  }, {
    key: "CompareTo",
    value: function CompareTo(other) {
      return compareUnions(this, other);
    }
  }]);

  return Token;
}();
setType("Lexer.Token", Token);
var lcBool = op_LessBarGreater()(pstring("true"))(pstring("false"));
var ucBool = op_LessBarGreater()(pstring("True"))(pstring("False"));
var pnull = pstring("null");
var keywordP = choice(map$1(function (str) {
  return pstring(str);
}, ofArray$1(["let", "val", "fun", "rec", "match", "with", "case", "switch", "function", "type", "class", "interface", "for", "while", "return", "yield", "int", "float", "bool", "string", "of"])));
var unescapedChar = function () {
  var label = "char";
  return satisfy(function (ch) {
    return ch !== "\\" ? ch !== "\"" : false;
  });
}();
var escapedChar = choice(map$1(function (tupledArg) {
  return op_GreaterGreaterPercent(pstring(tupledArg[0]), tupledArg[1]);
}, ofArray$1([["\\\"", "\""], ["\\\\", "\\"], ["\\/", "/"], ["\\b", "\b"], ["\\f", "\f"], ["\\n", "\n"], ["\\r", "\r"], ["\\t", "\t"]])));
var unicodeChar = function () {
  var backslash = pchar("\\");
  var uChar = pchar("u");
  var hexdigit = anyOf(append$1(toList(rangeChar("0", "9")), append$1(toList(rangeChar("A", "F")), toList(rangeChar("a", "f")))));

  var convertToChar = function convertToChar(tupledArg) {
    var h2 = tupledArg[0][0][1];
    var h1 = tupledArg[0][0][0];
    var str = fsFormat("%c%c%c%c")(function (x) {
      return x;
    })(h1)(h2)(tupledArg[0][1])(tupledArg[1]);
    return String.fromCharCode(Number.parseInt(str, 16));
  };

  return op_BarGreaterGreater(op_DotGreaterGreaterDot()(op_DotGreaterGreaterDot()(op_DotGreaterGreaterDot()(op_GreaterGreaterDot(op_GreaterGreaterDot(backslash, uChar), hexdigit))(hexdigit))(hexdigit))(hexdigit), convertToChar);
}();
var quotedString = function () {
  var dquote = pstring("\"");
  var squote = pstring("'");
  var jchar = op_LessBarGreater()(op_LessBarGreater()(unescapedChar)(escapedChar))(unicodeChar);
  return op_BarGreaterGreater(op_LessBarGreater()(op_DotGreaterGreaterDot()(op_DotGreaterGreaterDot()(dquote)(manyChars(jchar)))(dquote))(op_DotGreaterGreaterDot()(op_DotGreaterGreaterDot()(squote)(manyChars(jchar)))(squote)), function (tupledArg) {
    return tupledArg[0][0] + tupledArg[0][1] + tupledArg[0][0];
  });
}();
function blockComment(startc, endc) {
  var chars = notP(endc, satisfy(function (c) {
    return true;
  }));
  return op_BarGreaterGreater(op_DotGreaterGreaterDot()(op_DotGreaterGreaterDot()(startc)(manyChars(chars)))(endc), function (tupledArg) {
    return tupledArg[0][0] + tupledArg[0][1] + tupledArg[1];
  });
}
function op_BarGreaterQmark(opt$$1, f) {
  return opt$$1 != null ? f(opt$$1) : "";
}
function lineComment(startc) {
  var chars = satisfy(function (c) {
    return true;
  });
  var nl = pchar("\n");
  return op_BarGreaterGreater(op_DotGreaterGreaterDot()(op_DotGreaterGreaterDot()(startc)(manyChars(chars)))(op_BarGreaterGreater(opt(nl), function (o) {
    return equals(o) ? "" : "\n";
  })), function (tupledArg) {
    return tupledArg[0][0] + tupledArg[0][1] + tupledArg[1];
  });
}
var optSign = opt(pchar("-"));
var zero = pstring("0");
var digitOneNine = anyOf(toList(rangeChar("1", "9")));
var digit = anyOf(toList(rangeChar("0", "9")));
var point = pchar(".");
var e$1 = op_LessBarGreater()(pchar("e"))(pchar("E"));
var optPlusMinus = opt(op_LessBarGreater()(pchar("+"))(pchar("-")));
var nonZeroInt = op_BarGreaterGreater(op_DotGreaterGreaterDot()(digitOneNine)(manyChars(digit)), function (tupledArg) {
  return tupledArg[0] + tupledArg[1];
});
var intPart = op_LessBarGreater()(zero)(nonZeroInt);
var fractionPart = op_GreaterGreaterDot(point, manyChars1(digit));
var exponentPart = op_DotGreaterGreaterDot()(op_GreaterGreaterDot(e$1, optPlusMinus))(manyChars1(digit));
function convertToString(_arg1, expPart) {
  var optSign_1 = _arg1[0][0];
  var intPart_1 = _arg1[0][1];
  var signStr = op_BarGreaterQmark(optSign_1, function (value) {
    return value;
  });
  var fractionPartStr = op_BarGreaterQmark(_arg1[1], function (digits) {
    return "." + digits;
  });
  var expPartStr = op_BarGreaterQmark(expPart, function (tupledArg) {
    var sign = op_BarGreaterQmark(tupledArg[0], function (value) {
      return value;
    });
    return "e" + sign + tupledArg[1];
  });
  return signStr + intPart_1 + fractionPartStr + expPartStr;
}
var pnumber = op_BarGreaterGreater(op_DotGreaterGreaterDot()(op_DotGreaterGreaterDot()(op_DotGreaterGreaterDot()(optSign)(intPart))(opt(fractionPart)))(opt(exponentPart)), function (tupledArg) {
  return convertToString(tupledArg[0], tupledArg[1]);
});
var valueP = op_LessBarGreater()(op_LessBarGreater()(op_LessBarGreater()(lcBool)(ucBool))(pnull))(pnumber);
var operatorP = op_BarGreaterGreater(many1(choice(map$1(function (charToMatch) {
  return pchar(charToMatch);
}, ofArray$1(["+", "-", "@", ">", "<", "|", "&", ":", "?"])))), function (charList) {
  return charListToStr(charList);
});
var comment = op_BarGreaterGreater(choice(ofArray$1([blockComment(pstring("(*"), pstring("*)")), blockComment(pstring("/*"), pstring("*/")), blockComment(pstring("{-"), pstring("-}")), lineComment(pstring("//")), lineComment(pstring("--"))])), function (arg0) {
  return new Token("Comment", [arg0]);
});
var specificToken = choice(ofArray$1([op_BarGreaterGreater(keywordP, function (arg0) {
  return new Token("Keyword", [arg0]);
}), op_BarGreaterGreater(quotedString, function (arg0) {
  return new Token("String", [arg0]);
}), op_BarGreaterGreater(valueP, function (arg0) {
  return new Token("Value", [arg0]);
}), comment, op_BarGreaterGreater(operatorP, function (arg0) {
  return new Token("Operator", [arg0]);
})]));
var textChar = notP(specificToken, satisfy(function (_arg1) {
  return true;
}));
var textP = op_BarGreaterGreater(manyChars(textChar), function (arg0) {
  return new Token("Text", [arg0]);
});
function parseToken(str) {
  var matchValue = run(op_LessBarGreater()(specificToken)(textP), str);

  if (matchValue.Case === "Failure") {
    return [new Token("Text", [matchValue.Fields[0]]), ""];
  } else {
    var t = matchValue.Fields[0][0];
    var r = matchValue.Fields[0][1];
    return [t, r];
  }
}
function tokenize(code) {
  return code === "" ? new List() : function () {
    var patternInput = parseToken(code);
    return new List(patternInput[0], tokenize(patternInput[1]));
  }();
}

function augmentToken(tk) {
  return tk.Case === "Value" ? fsFormat("<span class=\"value\">%s</span>")(function (x) {
    return x;
  })(tk.Fields[0]) : tk.Case === "Operator" ? fsFormat("<span class=\"operator\">%s</span>")(function (x) {
    return x;
  })(tk.Fields[0]) : tk.Case === "String" ? fsFormat("<span class=\"string\">%s</span>")(function (x) {
    return x;
  })(tk.Fields[0]) : tk.Case === "Keyword" ? fsFormat("<span class=\"keyword\">%s</span>")(function (x) {
    return x;
  })(tk.Fields[0]) : tk.Case === "Text" ? tk.Fields[0] : fsFormat("<span class=\"comment\">%s</span>")(function (x) {
    return x;
  })(tk.Fields[0]);
}
function highlight(str) {
  return reduce(function (x, y) {
    return x + y;
  }, function (list) {
    return map$1(function (tk) {
      return augmentToken(tk);
    }, list);
  }(tokenize(str)));
}
var codeSnippets = document.querySelectorAll("pre > code");
{
  var inputSequence = toList(range(0, ~~codeSnippets.length - 1));
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = inputSequence[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var i = _step.value;
      var e$$1 = codeSnippets[i];
      codeSnippets[i].innerHTML = highlight(e$$1.innerHTML);
    }
  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion && _iterator.return) {
        _iterator.return();
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
      }
    }
  }
}

exports.augmentToken = augmentToken;
exports.highlight = highlight;
exports.codeSnippets = codeSnippets;

}((this.highlighter = this.highlighter || {})));

//# sourceMappingURL=bundle.js.map