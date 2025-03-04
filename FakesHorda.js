javascript:

coords='502|495 503|494 498|497 500|498 501|497 502|499 503|500 503|499 505|500 505|499 505|498 504|497 506|497 506|496 505|496 505|495 501|501 498|502 498|503 499|504 499|505 500|505 501|505 500|506 499|508 500|509 501|509 502|509 503|509 503|507 505|507 504|505 503|504 503|502 505|503 507|505 508|504 509|502 510|501 511|499 512|498 513|500 511|503 511|505 513|505 514|505 514|504 514|506 514|507 513|508 513|509 512|509 512|508 511|509 508|507 509|509 507|509 507|511 506|511 505|510 505|511 504|511 503|511 506|512 506|513 507|513 507|514 505|514 504|514 503|514 503|515 509|512 511|512 512|511 514|510 514|511 516|510 514|514 515|514 514|512 514|513 514|515 513|514 512|515 511|516 510|516 510|515 510|514 510|517 510|518 508|517 506|518 501|516 500|516 499|516 498|516 497|516 497|515 496|515 496|516 495|513 499|518 499|517 501|518 502|519 501|520 500|520 497|521 503|523 504|521 499|522 505|522 506|521 508|520 509|521 510|520 511|519 512|521 511|521 512|519 514|520 515|520 515|518 515|516 513|522 513|523 516|522 515|523 515|524 515|525 514|525 513|525 512|524 511|523 510|526 508|526 508|527 507|525 506|525 505|525 505|526 503|525 503|526 506|527 509|528 509|529 510|530 511|529 512|528 514|528 508|530 507|531 506|531 504|531 504|530 503|531 501|531 501|532 500|527 499|531 502|534 506|534 506|535 504|536 504|537 508|534 507|537 510|536 511|535 511|533 511|531 513|533 513|532 515|532 515|533 515|534 514|534 514|535 515|528 517|527 518|527 518|528 518|529 517|529 517|530 518|530';
name = "fakes";
msg = {
    target: "Objetivo numero",
    total: "Total:",
    error: "Tropas insuficientes!",
    end: "Final de la lista!"
};
var b = document;

function e(a) {
    return b.getElementsByName(a)[0];
}



function k(a) {
    return Number(e(a).nextSibling.nextSibling.innerHTML.match(/\d+/));
}

function n() {
    var a = p,
        t = q;

    function D(a, d) {
        a.push("\n");
        for (var c = 0; c < a.length; c++) {
            if (0 < d) {
                if (a[c][1]) {
                    k(a[c][0]) > a[c][1] ? (a[c][1] += 1, d -= unitsValor[a[c][0]], m += unitsValor[a[c][0]], insertUnit(e(a[c][0]), a[c][1])) : (a.splice(c, 1), c = -1);
                } else {
                    if (1 == a.length) break;
                    c = -1;
                }
            } else break;
        }
        0 < d && (e(name).innerHTML = " " + msg.error, e(name).style.color = "red");
    }
    var v = [],
        m = t,
        f = [
            ["main", 10, [1.17, 5]],
            ["farm", 5, [1.172102, -240]],
            ["storage", 6, [1, 0]],
            ["place", 0, [1, 0]],
            ["barracks", 16, [1.17, 7]],
            ["smith", 19, [1.17, 20]],
            ["wood", 6, [1.155, 5]],
            ["stone", 6, [1.14, 10]],
            ["iron", 6, [1.17, 10]],
            ["market", 10, [1.17, 20]],
            ["stable", 20, [1.17, 8]],
            ["wall", 8, [1.17, 5]],
            ["garage", 24, [1.17, 8]],
            ["hide", 5, [1.17, 2]],
            ["snob", 512, [1.17, 80]],
            ["statue", 24, [1, 10]]
        ],
        a = a.reverse(),
        w = f.map(function (a) {
            return Number(game_data.village.buildings[a[0]]);
        }),
        f = f.map(function (a, d) {
            return 0 == w[d] ? 0 : Math.round(a[1] * Math.pow(1.2, w[d] - 1));
        }),
        f = Math.floor(function (a) {
            var d = 0;
            a.forEach(function (a) {
                d += a;
            });
            return d;
        }(f) / 100);
    if (!(0 > f - t)) {
        for (x = 0; a.length > x;) e(a[x]) && 1 > k(a[x]) ? a.splice(x, 1) : x++;
        for (var g = 0; g < a.length; g++) {
            var l = Math.ceil((f - t) / a.length / unitsValor[a[g]]),
                l = l + Number(e(a[g]).value);
            l > k(a[g]) ? l = k(a[g]) : v.push([a[g], l]);
            m += unitsValor[a[g]] * l;
            insertUnit(e(a[g]), l);
        }
        f > m && D(v.reverse(), f - m);
    }
}
if (e("input") && "" == e("input").value) {
    e(name) || $("h3").append('<span name="' + name + '" style="color:green;font-size:11px;"></span>');
    var s = coords.split(" "),
        u = 0,
        p = [],
        q = 0,
        y = Math.floor((Math.random() * s.length) + 0).toString();
    /^-?[\d.]+(?:e-?\d+)?$/.test(y) && (u = Number(y));
    e(name).innerHTML = " " + msg.target + " " + (u) + "  (" + s[u] + "). " + msg.total + " " + s.length;
    e(name).style.color = "green";
    e("input").value = s[u];
    for (var z in units) {
        if (e(z)) {
            var A = units[z],
                B = Number(A),
                C = k(z) + B;
            "boolean" == typeof A && A ? insertUnit(e(z), k(z)) : "boolean" != typeof A || A ? 0 > B ? 0 < C && insertUnit(e(z), C) : k(z) >= A && insertUnit(e(z), B) : p.push(z);
            q += e(z).value * unitsValor[z];
        }
    }
    0 < p.length && n();
}
xProcess("inputx", "inputy");
btnA = document.getElementById('target_attack');
btnA.focus();
void(0)