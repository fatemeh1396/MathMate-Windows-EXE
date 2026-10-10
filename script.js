const themeBtn = document.getElementById("themeBtn");

let currentPage = "home";

function updateThemeButtonIcon(theme) {
    if (!themeBtn) return;
    const isDark = theme === "dark";
    const isEnglish = document.documentElement.lang === "en";
    const icon = themeBtn.querySelector(".theme-icon");
    if (icon) {
        icon.src = isDark ? "assets/icons/sun.svg" : "assets/icons/moon.svg";
        icon.alt = isDark
            ? (isEnglish ? "Light mode" : "حالت روشن")
            : (isEnglish ? "Dark mode" : "حالت تاریک");
    }
    themeBtn.setAttribute(
        "aria-label",
        isDark
            ? (isEnglish ? "Switch to light mode" : "تغییر به حالت روشن")
            : (isEnglish ? "Switch to dark mode" : "تغییر به حالت تاریک")
    );
    themeBtn.title = isDark
        ? (isEnglish ? "Light mode" : "حالت روشن")
        : (isEnglish ? "Dark mode" : "حالت تاریک");
}


// تغییر حالت روشن و تاریک
themeBtn.addEventListener("click", () => {

    const isDark = document.body.classList.toggle("dark");

    const theme = isDark ? "dark" : "light";

    updateThemeButtonIcon(theme);

    localStorage.setItem("mathmateTheme", theme);

    themeOptions.forEach((button) => {
        button.classList.remove("active");

        if (button.dataset.theme === theme) {
            button.classList.add("active");
        }
    });

});

// فعال شدن آیتم‌های نوار پایین
const navItems = document.querySelectorAll(".nav-item");

navItems.forEach((item) => {
    item.addEventListener("click", () => {

        navItems.forEach((nav) => {
            nav.classList.remove("active");
        });

        item.classList.add("active");

    });
});

// دکمه شروع
const startBtn = document.querySelector(".start-btn");

if (startBtn) {
    startBtn.addEventListener("click", () => {
        const btn = document.getElementById("moreToolsBtn");
        if (btn) btn.click();
        else {
            // fallback open tools
            currentPage = "tools";
            if (typeof activateToolsNav === "function") activateToolsNav();
            hideAllPages();
            document.querySelector(".header") && (document.querySelector(".header").style.display = "none");
            document.querySelector(".welcome-card") && (document.querySelector(".welcome-card").style.display = "none");
            document.querySelector(".tools-section") && (document.querySelector(".tools-section").style.display = "none");
            document.querySelector(".learning-card") && (document.querySelector(".learning-card").style.display = "none");
            if (toolsPage) toolsPage.classList.add("show");
            if (typeof setActiveSidebar === "function") setActiveSidebar("tools");
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    });
}

// ================= CALCULATOR PAGE =================

const calculatorCard = document.getElementById("calculatorCard");
const calculatorPage = document.getElementById("calculatorPage");
const calculatorBack = document.getElementById("calculatorBack");

calculatorCard.addEventListener("click", () => {

    currentPage = "home";

    // مخفی کردن صفحه اصلی
    document.querySelector(".header").style.display = "none";
    document.querySelector(".welcome-card").style.display = "none";
    document.querySelector(".tools-section").style.display = "none";
    document.querySelector(".learning-card").style.display = "none";

    // نمایش ماشین حساب
    calculatorPage.classList.add("show");

    // مخفی کردن نوار پایین
    const _bn = document.querySelector(".bottom-nav"); if (_bn) _bn.style.display = "none";

    // رفتن به بالای صفحه
    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
});


// دکمه بازگشت
calculatorBack.addEventListener("click", () => {

    // مخفی کردن ماشین حساب
    calculatorPage.classList.remove("show");

    // اگر از صفحه ابزارها آمده بودیم
    if (currentPage === "tools") {

        // صفحه ابزارها را دوباره نشان بده
        toolsPage.classList.add("show");

    } else {

        // صفحه خانه را دوباره نشان بده
        document.querySelector(".header").style.display = "flex";
        document.querySelector(".welcome-card").style.display = "flex";
        document.querySelector(".tools-section").style.display = "block";
        document.querySelector(".learning-card").style.display = "flex";

    }

    // نمایش نوار پایین
    const _bn2 = document.querySelector(".bottom-nav"); if (_bn2) _bn2.style.display = "none";

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

});

// ================= CALCULATOR LOGIC =================

const calcDisplay = document.getElementById("calculatorDisplay");
const calcButtons = document.querySelectorAll(".calc-btn");

let currentExpression = "";
let justCalculated = false;
// When user presses %, we keep the decimal value in currentExpression for math,
// but show the original number with a "%" sign so it is not confusing.
let percentDisplaySuffix = null; // e.g. "25%" while expression holds 0.25

function safeEvaluate(expr) {
    // Safe evaluator for + - * / and parentheses only (no Function/eval).
    const s = String(expr).replace(/\s+/g, "");
    if (!s || !/^[0-9+\-*/().]+$/.test(s)) throw new Error("Invalid expression");

    let i = 0;
    function peek() { return s[i] || ""; }
    function consume() { return s[i++] || ""; }

    function parseExpression() {
        let left = parseTerm();
        while (peek() === "+" || peek() === "-") {
            const op = consume();
            const right = parseTerm();
            left = op === "+" ? left + right : left - right;
        }
        return left;
    }
    function parseTerm() {
        let left = parseFactor();
        while (peek() === "*" || peek() === "/") {
            const op = consume();
            const right = parseFactor();
            if (op === "/" && right === 0) throw new Error("Division by zero");
            left = op === "*" ? left * right : left / right;
        }
        return left;
    }
    function parseFactor() {
        if (peek() === "+") { consume(); return parseFactor(); }
        if (peek() === "-") { consume(); return -parseFactor(); }
        if (peek() === "(") {
            consume();
            const v = parseExpression();
            if (peek() !== ")") throw new Error("Missing )");
            consume();
            return v;
        }
        let start = i;
        if (!/[0-9.]/.test(peek())) throw new Error("Expected number");
        while (/[0-9.]/.test(peek())) consume();
        const num = Number(s.slice(start, i));
        if (!Number.isFinite(num)) throw new Error("Invalid number");
        return num;
    }

    const result = parseExpression();
    if (i !== s.length) throw new Error("Unexpected input");
    if (!Number.isFinite(result)) throw new Error("Invalid result");
    return result;
}

function renderCalculatorDisplay() {
    if (!calcDisplay) return;
    if (percentDisplaySuffix != null && currentExpression !== "") {
        // Show human-friendly percent (e.g. 25%) while value is stored as decimal.
        const displayExpression = currentExpression
            .replace(/\*/g, "×")
            .replace(/\//g, "÷");
        // Replace trailing decimal that came from % with the labeled form
        const replaced = displayExpression.replace(
            /(\d+(?:\.\d+)?)$/,
            percentDisplaySuffix
        );
        calcDisplay.textContent = replaced || "0";
        return;
    }
    const displayExpression = currentExpression
        .replace(/\*/g, "×")
        .replace(/\//g, "÷");
    calcDisplay.textContent = displayExpression || "0";
}

function appendCalculatorValue(value) {
    if (/^\d$/.test(value)) {
        if (justCalculated) {
            currentExpression = "";
            justCalculated = false;
        }
        percentDisplaySuffix = null;
        currentExpression += value;
        return;
    }

    if (value === ".") {
        if (justCalculated) {
            currentExpression = "";
            justCalculated = false;
        }
        percentDisplaySuffix = null;
        const lastNumber = currentExpression.split(/[+\-*/]/).pop() || "";
        if (!lastNumber.includes(".")) {
            currentExpression += lastNumber === "" ? "0." : ".";
        }
        return;
    }

    if (["+", "-", "*", "/"].includes(value)) {
        justCalculated = false;
        percentDisplaySuffix = null;
        if (!currentExpression) {
            if (value === "-") currentExpression = "-";
            return;
        }
        if (/[+\-*/]$/.test(currentExpression)) {
            currentExpression = currentExpression.slice(0, -1) + value;
        } else {
            currentExpression += value;
        }
        return;
    }

    if (value === "%") {
        const match = currentExpression.match(/(\d+(?:\.\d+)?)$/);
        if (match) {
            const original = match[1];
            const numeric = Number(original) / 100;
            // Avoid ugly floating noise (e.g. 0.30000000000000004)
            const clean = String(Number(numeric.toFixed(12)));
            currentExpression = currentExpression.slice(0, -original.length) + clean;
            percentDisplaySuffix = original + "%";
            justCalculated = false;
        }
    }
}

calcButtons.forEach((button) => {
    button.addEventListener("click", () => {
        const value = button.dataset.value;
        if (!calcDisplay) return;

        if (value === "C") {
            currentExpression = "";
            justCalculated = false;
            percentDisplaySuffix = null;
            renderCalculatorDisplay();
            return;
        }

        if (value === "DEL") {
            if (justCalculated) justCalculated = false;
            if (percentDisplaySuffix != null) {
                // Undo percent: restore original number from label
                const orig = percentDisplaySuffix.replace(/%$/, "");
                const match = currentExpression.match(/(\d+(?:\.\d+)?)$/);
                if (match) {
                    currentExpression = currentExpression.slice(0, -match[1].length) + orig;
                }
                percentDisplaySuffix = null;
            } else {
                currentExpression = currentExpression.slice(0, -1);
            }
            renderCalculatorDisplay();
            return;
        }

        if (value === "=") {
            if (!currentExpression || /[+\-*/.]$/.test(currentExpression)) return;
            try {
                const result = safeEvaluate(currentExpression);
                currentExpression = String(Number(result.toFixed(12)));
                justCalculated = true;
                percentDisplaySuffix = null;
                renderCalculatorDisplay();
            } catch (error) {
                calcDisplay.textContent = translateKey("alert_calc_error");
                currentExpression = "";
                justCalculated = false;
                percentDisplaySuffix = null;
            }
            return;
        }

        appendCalculatorValue(value);
        renderCalculatorDisplay();
    });
});

// ================= MULTIPLES PAGE =================

const multiplesCard = document.getElementById("multiplesCard");
const multiplesPage = document.getElementById("multiplesPage");
const multiplesBack = document.getElementById("multiplesBack");

multiplesCard.addEventListener("click", () => {

    currentPage = "home";

    // مخفی کردن صفحه اصلی
    document.querySelector(".header").style.display = "none";
    document.querySelector(".welcome-card").style.display = "none";
    document.querySelector(".tools-section").style.display = "none";
    document.querySelector(".learning-card").style.display = "none";

    // نمایش صفحه مضرب‌ها
    multiplesPage.classList.add("show");

    // مخفی کردن نوار پایین
    const _bn = document.querySelector(".bottom-nav"); if (_bn) _bn.style.display = "none";

    // رفتن به بالای صفحه
    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
});


// دکمه بازگشت از مضرب‌ها
multiplesBack.addEventListener("click", () => {

    multiplesPage.classList.remove("show");

    if (currentPage === "tools") {

        toolsPage.classList.add("show");

    } else {

        document.querySelector(".header").style.display = "flex";
        document.querySelector(".welcome-card").style.display = "flex";
        document.querySelector(".tools-section").style.display = "block";
        document.querySelector(".learning-card").style.display = "flex";

    }

    const _bn2 = document.querySelector(".bottom-nav"); if (_bn2) _bn2.style.display = "none";

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

});

// ================= MULTIPLES LOGIC =================

const multipleNumber = document.getElementById("multipleNumber");
const multipleCount = document.getElementById("multipleCount");
const calculateMultiples = document.getElementById("calculateMultiples");
const multiplesResult = document.getElementById("multiplesResult");
const multiplesList = document.getElementById("multiplesList");


calculateMultiples.addEventListener("click", () => {

    // گرفتن عدد واردشده
    const number = Number(multipleNumber.value);
    const count = Number(multipleCount.value);

    // بررسی اینکه کاربر عدد وارد کرده باشد
    if (!multipleNumber.value || !multipleCount.value) {
        alert(translateKey("alert_calc_both"));
        return;
    }

    // بررسی معتبر بودن اعداد
    if (!Number.isFinite(number) || !Number.isInteger(count) || count <= 0) {
        alert(translateKey("alert_calc_numbers"));
        return;
    }

    // پاک کردن نتایج قبلی
    multiplesList.innerHTML = "";

    // ساخت مضرب‌ها
    for (let i = 1; i <= count; i++) {

        const multiple = number * i;

        const item = document.createElement("div");

        item.classList.add("multiple-item");

        item.textContent = multiple;

        multiplesList.appendChild(item);
    }

    // نمایش بخش نتیجه
    multiplesResult.classList.add("show");
});

// ================= GEOMETRY PAGE =================

const geometryCard = document.getElementById("geometryCard");
const geometryPage = document.getElementById("geometryPage");
const geometryBack = document.getElementById("geometryBack");


// باز کردن صفحه مساحت و محیط
geometryCard.addEventListener("click", () => {

    currentPage = "home";

    // مخفی کردن صفحه اصلی
    document.querySelector(".header").style.display = "none";
    document.querySelector(".welcome-card").style.display = "none";
    document.querySelector(".tools-section").style.display = "none";
    document.querySelector(".learning-card").style.display = "none";

    // نمایش صفحه هندسه
    geometryPage.classList.add("show");

    // مخفی کردن نوار پایین
    const _bn = document.querySelector(".bottom-nav"); if (_bn) _bn.style.display = "none";

    // رفتن به بالای صفحه
    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
});


// دکمه بازگشت
geometryBack.addEventListener("click", () => {

    // مخفی کردن صفحه هندسه
    geometryPage.classList.remove("show");

    // اگر از صفحه ابزارها آمده بودیم
    if (currentPage === "tools") {

        // نمایش صفحه ابزارها
        toolsPage.classList.add("show");

    } else {

        // نمایش صفحه خانه
        document.querySelector(".header").style.display = "flex";
        document.querySelector(".welcome-card").style.display = "flex";
        document.querySelector(".tools-section").style.display = "block";
        document.querySelector(".learning-card").style.display = "flex";

    }

    // نمایش نوار پایین
    const _bn2 = document.querySelector(".bottom-nav"); if (_bn2) _bn2.style.display = "none";

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

});

// ================= GEOMETRY LOGIC =================

const shapeCards = document.querySelectorAll(".shape-card");
const geometryInputs = document.getElementById("geometryInputs");
const calculateGeometry = document.getElementById("calculateGeometry");
const geometryResult = document.getElementById("geometryResult");
const areaResult = document.getElementById("areaResult");
const perimeterResult = document.getElementById("perimeterResult");

let selectedShape = "rectangle";


// نمایش ورودی‌های مربوط به هر شکل
function showGeometryInputs(shape) {
    const isEnglish = document.documentElement.lang === "en";
    const text = isEnglish ? {
        length: "Length", width: "Width", side: "Side length",
        base: "Base", height: "Height", side1: "Side 1", side2: "Side 2", radius: "Radius"
    } : {
        length: "طول", width: "عرض", side: "اندازه ضلع",
        base: "قاعده", height: "ارتفاع", side1: "ضلع اول", side2: "ضلع دوم", radius: "شعاع"
    };
    const example = isEnglish ? "e.g. " : "مثلاً ";

    if (shape === "rectangle") {
        geometryInputs.innerHTML = `
            <div class="geometry-input">
                <label>${text.length}</label>
                <input type="number" id="length" placeholder="${example}10">
            </div>
            <div class="geometry-input">
                <label>${text.width}</label>
                <input type="number" id="width" placeholder="${example}5">
            </div>
        `;
    } else if (shape === "square") {
        geometryInputs.innerHTML = `
            <div class="geometry-input">
                <label>${text.side}</label>
                <input type="number" id="side" placeholder="${example}8">
            </div>
        `;
    } else if (shape === "triangle") {
        geometryInputs.innerHTML = `
            <div class="geometry-input">
                <label>${text.base}</label>
                <input type="number" id="base" placeholder="${example}10">
            </div>
            <div class="geometry-input">
                <label>${text.height}</label>
                <input type="number" id="height" placeholder="${example}6">
            </div>
            <div class="geometry-input">
                <label>${text.side1}</label>
                <input type="number" id="side1" placeholder="${example}8">
            </div>
            <div class="geometry-input">
                <label>${text.side2}</label>
                <input type="number" id="side2" placeholder="${example}7">
            </div>
        `;
    } else if (shape === "circle") {
        geometryInputs.innerHTML = `
            <div class="geometry-input">
                <label>${text.radius}</label>
                <input type="number" id="radius" placeholder="${example}5">
            </div>
        `;
    }
}



// انتخاب شکل
shapeCards.forEach((card) => {

    card.addEventListener("click", () => {

        // حذف انتخاب قبلی
        shapeCards.forEach((item) => {
            item.classList.remove("active");
        });

        // انتخاب شکل جدید
        card.classList.add("active");

        selectedShape = card.dataset.shape;

        // مخفی کردن نتیجه قبلی
        geometryResult.classList.remove("show");

        // نمایش ورودی‌های جدید
        showGeometryInputs(selectedShape);
    });
});


// نمایش ورودی اولیه مستطیل
showGeometryInputs(selectedShape);


// محاسبه
calculateGeometry.addEventListener("click", () => {

    let area;
    let perimeter;


    // مستطیل
    if (selectedShape === "rectangle") {

        const length = Number(document.getElementById("length").value);
        const width = Number(document.getElementById("width").value);

        if (length <= 0 || width <= 0) {
            alert(translateKey("alert_geometry_rect"));
            return;
        }

        area = length * width;
        perimeter = 2 * (length + width);
    }


    // مربع
    else if (selectedShape === "square") {

        const side = Number(document.getElementById("side").value);

        if (side <= 0) {
            alert(translateKey("alert_geometry_square"));
            return;
        }

        area = side * side;
        perimeter = 4 * side;
    }


    // مثلث
    else if (selectedShape === "triangle") {

        const base = Number(document.getElementById("base").value);
        const height = Number(document.getElementById("height").value);
        const side1 = Number(document.getElementById("side1").value);
        const side2 = Number(document.getElementById("side2").value);

        if (base <= 0 || height <= 0 || side1 <= 0 || side2 <= 0) {
            alert(translateKey("alert_geometry_triangle"));
            return;
        }

        // Triangle inequality on the three sides (base, side1, side2)
        if (
            base + side1 <= side2 ||
            base + side2 <= side1 ||
            side1 + side2 <= base
        ) {
            alert(
                document.documentElement.lang === "en"
                    ? "These sides cannot form a triangle."
                    : "این اضلاع نمی‌توانند یک مثلث بسازند."
            );
            return;
        }

        area = (base * height) / 2;
        perimeter = base + side1 + side2;
    }


    // دایره
    else if (selectedShape === "circle") {

        const radius = Number(document.getElementById("radius").value);

        if (radius <= 0) {
            alert(translateKey("alert_geometry_circle"));
            return;
        }

        area = Math.PI * radius * radius;
        perimeter = 2 * Math.PI * radius;
    }


    // نمایش نتیجه
    areaResult.textContent = area.toFixed(2);
    perimeterResult.textContent = perimeter.toFixed(2);

    geometryResult.classList.add("show");
});

// ================= GCD & LCM PAGE =================

const gcdLcmCard = document.getElementById("gcdLcmCard");
const gcdLcmPage = document.getElementById("gcdLcmPage");
const gcdLcmBack = document.getElementById("gcdLcmBack");


// باز کردن صفحه ب.م.م و ک.م.م
gcdLcmCard.addEventListener("click", () => {

    currentPage = "home";

    // مخفی کردن صفحه اصلی
    document.querySelector(".header").style.display = "none";
    document.querySelector(".welcome-card").style.display = "none";
    document.querySelector(".tools-section").style.display = "none";
    document.querySelector(".learning-card").style.display = "none";

    // نمایش صفحه ب.م.م و ک.م.م
    gcdLcmPage.classList.add("show");

    // مخفی کردن نوار پایین
    const _bn = document.querySelector(".bottom-nav"); if (_bn) _bn.style.display = "none";

    // رفتن به بالای صفحه
    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
});


// دکمه بازگشت
gcdLcmBack.addEventListener("click", () => {

    gcdLcmPage.classList.remove("show");

    if (currentPage === "tools") {

        toolsPage.classList.add("show");

    } else {

        document.querySelector(".header").style.display = "flex";
        document.querySelector(".welcome-card").style.display = "flex";
        document.querySelector(".tools-section").style.display = "block";
        document.querySelector(".learning-card").style.display = "flex";

    }

    const _bn2 = document.querySelector(".bottom-nav"); if (_bn2) _bn2.style.display = "none";

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

});

// ================= GCD & LCM LOGIC =================

const gcdNumber1 = document.getElementById("gcdNumber1");
const gcdNumber2 = document.getElementById("gcdNumber2");

const calculateGcdLcm = document.getElementById("calculateGcdLcm");

const gcdLcmResult = document.getElementById("gcdLcmResult");
const gcdResult = document.getElementById("gcdResult");
const lcmResult = document.getElementById("lcmResult");


// تابع محاسبه ب.م.م با الگوریتم اقلیدس
function gcd(a, b) {

    a = Math.abs(a);
    b = Math.abs(b);

    while (b !== 0) {

        let temp = b;

        b = a % b;

        a = temp;
    }

    return a;
}


// تابع محاسبه ک.م.م
function lcm(a, b) {

    return Math.abs(a * b) / gcd(a, b);
}


// کلیک روی دکمه محاسبه
calculateGcdLcm.addEventListener("click", () => {

    const number1 = Number(gcdNumber1.value);
    const number2 = Number(gcdNumber2.value);


    // بررسی معتبر بودن ورودی‌ها
    if (
        !gcdNumber1.value ||
        !gcdNumber2.value ||
        !Number.isInteger(number1) ||
        !Number.isInteger(number2) ||
        number1 <= 0 ||
        number2 <= 0
    ) {

        alert(translateKey("alert_gcd"));

        return;
    }


    // محاسبه ب.م.م
    const gcdValue = gcd(number1, number2);

    // محاسبه ک.م.م
    const lcmValue = lcm(number1, number2);


    // نمایش نتیجه
    gcdResult.textContent = gcdValue;
    lcmResult.textContent = lcmValue;

    gcdLcmResult.classList.add("show");
});

// ================= LEARNING PAGE =================

const learningCard = document.getElementById("learningCard");
const learningPage = document.getElementById("learningPage");
const learningBack = document.getElementById("learningBack");

const learningSearch = document.getElementById("learningSearch");
const searchAparat = document.getElementById("searchAparat");
const searchYoutube = document.getElementById("searchYoutube");


// باز کردن صفحه آموزش
learningCard.addEventListener("click", () => {

    currentPage = "home";

    // مخفی کردن صفحه اصلی
    document.querySelector(".header").style.display = "none";
    document.querySelector(".welcome-card").style.display = "none";
    document.querySelector(".tools-section").style.display = "none";
    document.querySelector(".learning-card").style.display = "none";

    // نمایش صفحه آموزش
    learningPage.classList.add("show");

    // مخفی کردن نوار پایین
    const _bn = document.querySelector(".bottom-nav"); if (_bn) _bn.style.display = "none";

    // رفتن به بالای صفحه
    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
});


// بازگشت از صفحه آموزش
learningBack.addEventListener("click", () => {

    // مخفی کردن صفحه آموزش
    learningPage.classList.remove("show");

    // اگر از صفحه ابزارها آمده بودیم
    if (currentPage === "tools") {

        // دوباره صفحه ابزارها را نمایش بده
        toolsPage.classList.add("show");

    } else {

        // در غیر این صورت صفحه خانه را نمایش بده
        document.querySelector(".header").style.display = "flex";
        document.querySelector(".welcome-card").style.display = "flex";
        document.querySelector(".tools-section").style.display = "block";
        document.querySelector(".learning-card").style.display = "flex";
    }

    // نمایش نوار پایین
    const _bn2 = document.querySelector(".bottom-nav"); if (_bn2) _bn2.style.display = "none";

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

});


// جستجو در آپارات
searchAparat.addEventListener("click", () => {

    const searchText = learningSearch.value.trim();

    if (searchText === "") {
        alert(translateKey("alert_learning"));
        return;
    }

    const q = encodeURIComponent(searchText);

    const aparatUrl =
        "https://www.aparat.com/search/" + q;

    window.open(aparatUrl, "_blank");
});


// جستجو در یوتیوب
searchYoutube.addEventListener("click", () => {

    const searchText = learningSearch.value.trim();

    if (searchText === "") {
        alert(translateKey("alert_learning"));
        return;
    }

    const youtubeUrl =
        "https://www.youtube.com/results?search_query=" +
        encodeURIComponent(searchText);

    window.open(youtubeUrl, "_blank");
});

// ================= FACTORS PAGE =================

const factorsCard = document.getElementById("factorsCard");

const factorsPage = document.getElementById("factorsPage");

const factorsBack = document.getElementById("factorsBack");


// باز کردن صفحه شمارنده‌ها

factorsCard.addEventListener("click", () => {

    currentPage = "home";

    // مخفی کردن صفحه اصلی

    document.querySelector(".header").style.display = "none";

    document.querySelector(".welcome-card").style.display = "none";

    document.querySelector(".tools-section").style.display = "none";

    document.querySelector(".learning-card").style.display = "none";


    // نمایش صفحه شمارنده‌ها

    factorsPage.classList.add("show");


    // مخفی کردن نوار پایین

    const _bn = document.querySelector(".bottom-nav"); if (_bn) _bn.style.display = "none";


    // رفتن به بالای صفحه

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

});


// ================= بازگشت =================

factorsBack.addEventListener("click", () => {

    factorsPage.classList.remove("show");

    if (currentPage === "tools") {

        toolsPage.classList.add("show");

    } else {

        document.querySelector(".header").style.display = "flex";
        document.querySelector(".welcome-card").style.display = "flex";
        document.querySelector(".tools-section").style.display = "block";
        document.querySelector(".learning-card").style.display = "flex";

    }

    const _bn2 = document.querySelector(".bottom-nav"); if (_bn2) _bn2.style.display = "none";

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

});


// ================= FACTORS LOGIC =================

const factorsNumber =
    document.getElementById("factorsNumber");

const calculateFactors =
    document.getElementById("calculateFactors");

const factorsResult =
    document.getElementById("factorsResult");

const factorsList =
    document.getElementById("factorsList");


// محاسبه شمارنده‌ها

calculateFactors.addEventListener("click", () => {

    const number = Number(factorsNumber.value);


    // بررسی عدد

    if (
        !factorsNumber.value ||
        !Number.isInteger(number) ||
        number <= 0
    ) {

        alert(translateKey("alert_factors"));

        return;
    }


    // پاک کردن نتیجه قبلی

    factorsList.innerHTML = "";


    // پیدا کردن شمارنده‌ها

    for (let i = 1; i <= number; i++) {

        if (number % i === 0) {

            const item =
                document.createElement("div");

            item.classList.add("factor-item");

            item.textContent = i;

            factorsList.appendChild(item);
        }

    }


    // نمایش نتیجه

    factorsResult.classList.add("show");

});

function hideAllPages() {
    document.querySelectorAll(".page").forEach((page) => {
        page.classList.remove("show");
    });
}

// ================= TOOLS NAVIGATION =================***

const toolsNav = document.getElementById("toolsNav");
const toolsPage = document.getElementById("toolsPage");
const moreToolsBtn = document.getElementById("moreToolsBtn");
const startLearningCard = document.getElementById("startLearningCard");

function activateToolsNav() {
    // غیرفعال کردن همه دکمه‌های نوار پایین
    navItems.forEach((nav) => {
        nav.classList.remove("active");
    });
    // فعال کردن ابزارها (اگر نوار پایین وجود داشته باشد)
    if (toolsNav) toolsNav.classList.add("active");
}

// رفتن به صفحه ابزارها از نوار پایین
if (toolsNav) toolsNav.addEventListener("click", () => {

    currentPage = "tools";

    activateToolsNav();

    hideAllPages();

    // مخفی کردن صفحه خانه
    document.querySelector(".header").style.display = "none";
    document.querySelector(".welcome-card").style.display = "none";
    document.querySelector(".tools-section").style.display = "none";
    document.querySelector(".learning-card").style.display = "none";

    // نمایش صفحه ابزارها
    toolsPage.classList.add("show");

    // نوار پایین باقی بماند
    const _bn2 = document.querySelector(".bottom-nav"); if (_bn2) _bn2.style.display = "none";

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

});


// ================= HOME NAVIGATION =================

const homeNav = document.getElementById("homeNav");

if (homeNav) homeNav.addEventListener("click", () => {

    // مخفی کردن تمام صفحه‌های جداگانه
    hideAllPages();

    // نمایش دوباره صفحه خانه
    document.querySelector(".header").style.display = "flex";
    document.querySelector(".welcome-card").style.display = "flex";
    document.querySelector(".tools-section").style.display = "block";
    document.querySelector(".learning-card").style.display = "flex";

    // فعال کردن خانه در نوار پایین
    navItems.forEach((nav) => {
        nav.classList.remove("active");
    });

    homeNav.classList.add("active");

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

});


// ================= MORE TOOLS BUTTON =================

if (moreToolsBtn) moreToolsBtn.addEventListener("click", () => {
    currentPage = "tools";
    activateToolsNav();
    hideAllPages();
    document.querySelector(".header") && (document.querySelector(".header").style.display = "none");
    document.querySelector(".welcome-card") && (document.querySelector(".welcome-card").style.display = "none");
    document.querySelector(".tools-section") && (document.querySelector(".tools-section").style.display = "none");
    document.querySelector(".learning-card") && (document.querySelector(".learning-card").style.display = "none");
    if (toolsPage) toolsPage.classList.add("show");
    if (typeof setActiveSidebar === "function") setActiveSidebar("tools");
    window.scrollTo({ top: 0, behavior: "smooth" });
});

// ================= START LEARNING CARD =================

if (startLearningCard) startLearningCard.addEventListener("click", (e) => {
    e.stopPropagation();
    currentPage = "tools";
    activateToolsNav();
    hideAllPages();
    document.querySelector(".header") && (document.querySelector(".header").style.display = "none");
    document.querySelector(".welcome-card") && (document.querySelector(".welcome-card").style.display = "none");
    document.querySelector(".tools-section") && (document.querySelector(".tools-section").style.display = "none");
    document.querySelector(".learning-card") && (document.querySelector(".learning-card").style.display = "none");
    if (toolsPage) toolsPage.classList.add("show");
    if (typeof setActiveSidebar === "function") setActiveSidebar("tools");
    window.scrollTo({ top: 0, behavior: "smooth" });
});

// ================= VIDEOS NAVIGATION =================

const videosNav = document.getElementById("videosNav");
const videosPage = document.getElementById("videosPage");

if (videosNav) videosNav.addEventListener("click", () => {

    currentPage = "videos";

    // بستن تمام صفحه‌های جداگانه
    hideAllPages();

    // مخفی کردن صفحه خانه
    document.querySelector(".header").style.display = "none";
    document.querySelector(".welcome-card").style.display = "none";
    document.querySelector(".tools-section").style.display = "none";
    document.querySelector(".learning-card").style.display = "none";

    // نمایش صفحه فیلم‌های آموزشی
    videosPage.classList.add("show");

    // فعال کردن آموزش در نوار پایین
    navItems.forEach((nav) => {
        nav.classList.remove("active");
    });

    videosNav.classList.add("active");

    // رفتن به بالای صفحه
    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

});

// ================= TOOLS PAGE CARDS =================

// کارت‌های داخل صفحه ابزارها
const toolsCalculator = document.getElementById("toolsCalculator");
const toolsGeometry = document.getElementById("toolsGeometry");
const toolsGcdLcm = document.getElementById("toolsGcdLcm");
const toolsMultiples = document.getElementById("toolsMultiples");
const toolsFactors = document.getElementById("toolsFactors");
const toolsLearning = document.getElementById("toolsLearning");


// تابع مخفی کردن صفحه ابزارها
function closeToolsPage() {
    toolsPage.classList.remove("show");
}


// ماشین حساب
toolsCalculator.addEventListener("click", () => {

    currentPage = "tools";

    hideAllPages();

    closeToolsPage();

    calculatorPage.classList.add("show");

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

});


// مساحت و محیط
toolsGeometry.addEventListener("click", () => {

    currentPage = "tools";

    hideAllPages();

    closeToolsPage();

    geometryPage.classList.add("show");

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

});


// ب.م.م و ک.م.م
toolsGcdLcm.addEventListener("click", () => {

    currentPage = "tools";

    hideAllPages();

    closeToolsPage();

    gcdLcmPage.classList.add("show");

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

});


// مضرب‌ها
toolsMultiples.addEventListener("click", () => {

    currentPage = "tools";

    hideAllPages();

    closeToolsPage();

    multiplesPage.classList.add("show");

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

});


// شمارنده‌ها
toolsFactors.addEventListener("click", () => {

    currentPage = "tools";

    hideAllPages();

    closeToolsPage();

    factorsPage.classList.add("show");

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

});

// آموزش
toolsLearning.addEventListener("click", () => {

    currentPage = "tools";

    hideAllPages();

    closeToolsPage();

    learningPage.classList.add("show");

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

});

/* ================= DATE PAGE ================= */

const toolsDate = document.getElementById("toolsDate");

const datePage = document.getElementById("datePage");

const dateBack = document.getElementById("dateBack");


// باز کردن صفحه تبدیل تاریخ

toolsDate.addEventListener("click", () => {

    currentPage = "tools";

    hideAllPages();

    closeToolsPage();

    datePage.classList.add("show");

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

});


// بازگشت از صفحه تبدیل تاریخ

dateBack.addEventListener("click", () => {

    datePage.classList.remove("show");

    toolsPage.classList.add("show");

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

});

// ================= SETTINGS & ABOUT =================

// صفحات
const settingsPage = document.getElementById("settingsPage");
const aboutPage = document.getElementById("aboutPage");

// دکمه‌های نوار پایین
const settingsNav = document.getElementById("settingsNav");
const aboutNav = document.getElementById("aboutNav");


// ================= مخفی کردن صفحه اصلی =================

function hideHomePage() {

    document.querySelector(".header").style.display = "none";
    document.querySelector(".welcome-card").style.display = "none";
    document.querySelector(".tools-section").style.display = "none";
    document.querySelector(".learning-card").style.display = "none";

}


// ================= نمایش صفحه تنظیمات =================

function showSettingsPage() {

    currentPage = "settings";

    // مخفی کردن تمام صفحه‌های دیگر
    hideAllPages();

    // مخفی کردن صفحه اصلی
    hideHomePage();

    // نمایش تنظیمات
    settingsPage.classList.add("show");

    // فعال کردن دکمه تنظیمات
    navItems.forEach(nav => {
        nav.classList.remove("active");
    });

    settingsNav.classList.add("active");

    // رفتن به بالای صفحه
    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


// کلیک روی تنظیمات
if (settingsNav) {

    settingsNav.addEventListener("click", () => {

        showSettingsPage();

    });

}


// ================= نمایش صفحه درباره ما =================

function showAboutPage() {

    currentPage = "about";

    // مخفی کردن تمام صفحه‌های دیگر
    hideAllPages();

    // مخفی کردن صفحه اصلی
    hideHomePage();

    // نمایش صفحه درباره ما
    aboutPage.classList.add("show");

    // فعال کردن دکمه درباره ما
    navItems.forEach(nav => {
        nav.classList.remove("active");
    });

    aboutNav.classList.add("active");

    // رفتن به بالای صفحه
    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


// کلیک روی درباره ما
if (aboutNav) {

    aboutNav.addEventListener("click", () => {

        showAboutPage();

    });

}


// ================= FONT SIZE =================

const fontSizeButtons =
    document.querySelectorAll(".font-size-btn");


// تغییر اندازه نوشته
function changeFontSize(size) {

    document.body.classList.remove(
        "font-small",
        "font-normal",
        "font-large"
    );

    document.body.classList.add(`font-${size}`);

    localStorage.setItem("mathmateFontSize", size);
}


// کلیک روی دکمه‌های اندازه نوشته
fontSizeButtons.forEach(button => {

    button.addEventListener("click", () => {

        const size = button.dataset.size;

        // تغییر اندازه
        changeFontSize(size);

        // حذف active قبلی
        fontSizeButtons.forEach(btn => {
            btn.classList.remove("active");
        });

        // فعال کردن دکمه جدید
        button.classList.add("active");

    });

});


// بارگذاری اندازه ذخیره‌شده
const savedFontSize =
    localStorage.getItem("mathmateFontSize") || "normal";


// اعمال اندازه
changeFontSize(savedFontSize);


// فعال کردن دکمه درست
fontSizeButtons.forEach(button => {

    if (button.dataset.size === savedFontSize) {

        button.classList.add("active");

    } else {

        button.classList.remove("active");

    }

});


// ================= THEME SETTINGS =================

const themeOptions =
    document.querySelectorAll(".theme-option");


// تغییر حالت روشن و تاریک
function changeTheme(theme) {

    if (theme === "dark") {

        document.body.classList.add("dark");

        // تغییر آیکون

    } else {

        document.body.classList.remove("dark");

        // تغییر آیکون

    }

    updateThemeButtonIcon(theme);

    // ذخیره تنظیم
    localStorage.setItem(
        "mathmateTheme",
        theme
    );

}


// کلیک روی دکمه‌های حالت
themeOptions.forEach(button => {

    button.addEventListener("click", () => {

        const theme = button.dataset.theme;

        // تغییر حالت
        changeTheme(theme);

        // حذف active قبلی
        themeOptions.forEach(btn => {
            btn.classList.remove("active");
        });

        // فعال کردن دکمه انتخاب‌شده
        button.classList.add("active");

    });

});


// بارگذاری حالت ذخیره‌شده
const savedTheme =
    localStorage.getItem("mathmateTheme") || "light";


// اعمال حالت
changeTheme(savedTheme);


// فعال کردن دکمه درست
themeOptions.forEach(button => {

    if (button.dataset.theme === savedTheme) {

        button.classList.add("active");

    } else {

        button.classList.remove("active");

    }

});


// ================= DEVICE INFORMATION =================

const osInfo = document.getElementById("osInfo");
const userAgent = navigator.userAgent || "";
const platform = navigator.platform || "";

function detectOSVersion() {
    // Windows
    if (/Windows NT 10\.0/.test(userAgent)) {
        // Win11 often still reports NT 10.0; use platform or touch heuristics
        if (navigator.userAgentData && navigator.userAgentData.platform === "Windows") {
            // try high-entropy if available later
        }
        // Windows 11 detection: UA often still 10.0; check for specific tokens
        if (/Windows NT 10\.0.*Win64/.test(userAgent) && (window.chrome || /Edg\//.test(userAgent))) {
            // Many Win11 browsers still say 10.0 — show Windows 10/11
            return "Windows 10 / 11";
        }
        return "Windows 10";
    }
    if (/Windows NT 6\.3/.test(userAgent)) return "Windows 8.1";
    if (/Windows NT 6\.2/.test(userAgent)) return "Windows 8";
    if (/Windows NT 6\.1/.test(userAgent)) return "Windows 7";
    if (/Windows NT 6\.0/.test(userAgent)) return "Windows Vista";
    if (/Windows NT 5\.1/.test(userAgent) || /Windows XP/.test(userAgent)) return "Windows XP";
    if (/Windows/.test(userAgent)) return "Windows";

    // Android
    const androidMatch = userAgent.match(/Android\s([0-9.]+)/);
    if (androidMatch) return "Android " + androidMatch[1];

    // iOS
    if (/iPhone|iPad|iPod/.test(userAgent)) {
        const iosMatch = userAgent.match(/OS (\d+)[._](\d+)/);
        if (iosMatch) return "iOS " + iosMatch[1] + "." + iosMatch[2];
        return "iOS";
    }

    // macOS
    if (/Mac OS X/.test(userAgent)) {
        const macMatch = userAgent.match(/Mac OS X (\d+[._]\d+)/);
        if (macMatch) return "macOS " + macMatch[1].replace("_", ".");
        return "macOS";
    }

    if (/Linux/.test(userAgent)) return "Linux";
    return "Unknown";
}

if (osInfo) {
    osInfo.textContent = detectOSVersion();
}


// ---------- معماری سیستم ----------

const architectureInfo =
    document.getElementById("architectureInfo");

let architecture =
    "نامشخص";


if (
    userAgent.includes("Win64") ||
    userAgent.includes("x64") ||
    userAgent.includes("x86_64")
) {

    architecture = "64-bit";

} else if (
    userAgent.includes("WOW64") ||
    userAgent.includes("x86")
) {

    architecture = "32-bit";

}


// نمایش معماری
if (architectureInfo) {

    architectureInfo.textContent =
        architecture;

}


// ---------- مرورگر ----------

const browserInfo =
    document.getElementById("browserInfo");

let browser =
    "نامشخص";


if (userAgent.includes("Firefox")) {

    browser = "Firefox";

} else if (userAgent.includes("Edg")) {

    browser = "Microsoft Edge";

} else if (
    userAgent.includes("Chrome") &&
    !userAgent.includes("Edg")
) {

    browser = "Google Chrome";

} else if (
    userAgent.includes("Safari") &&
    !userAgent.includes("Chrome")
) {

    browser = "Safari";

}


// نمایش مرورگر
if (browserInfo) {

    browserInfo.textContent =
        browser;

}



// ================= تبدیل تاریخ =================

const dateCalendarOptions =
    document.querySelectorAll(".date-calendar-option");

const dateYear =
    document.getElementById("dateYear");

const dateMonth =
    document.getElementById("dateMonth");

const dateDay =
    document.getElementById("dateDay");

const calculateDate =
    document.getElementById("calculateDate");

const jalaliResult =
    document.getElementById("jalaliResult");

const gregorianResult =
    document.getElementById("gregorianResult");

const hijriResult =
    document.getElementById("hijriResult");

const dateResult =
    document.getElementById("dateResult");


let selectedCalendar = "jalali";


// ================= انتخاب تقویم =================

dateCalendarOptions.forEach(button => {

    button.addEventListener("click", () => {

        dateCalendarOptions.forEach(btn => {
            btn.classList.remove("active");
        });

        button.classList.add("active");

        selectedCalendar =
            button.dataset.calendar;

        console.log(
            "تقویم انتخاب شده:",
            selectedCalendar
        );

    });

});


// ================= تبدیل شمسی به میلادی =================

function jalaliToGregorian(jy, jm, jd) {

    let gy;

    if (jy > 979) {
        gy = 1600;
        jy -= 979;
    } else {
        gy = 621;
    }

    let days =
        (365 * jy) +
        Math.floor(jy / 33) * 8 +
        Math.floor(((jy % 33) + 3) / 4) +
        78 +
        jd +
        (jm < 7
            ? (jm - 1) * 31
            : ((jm - 7) * 30) + 186);

    gy +=
        400 *
        Math.floor(days / 146097);

    days %= 146097;

    if (days > 36524) {

        gy +=
            100 *
            Math.floor(--days / 36524);

        days %= 36524;

        if (days >= 365) {
            days++;
        }
    }

    gy +=
        4 *
        Math.floor(days / 1461);

    days %= 1461;

    if (days > 365) {

        gy +=
            Math.floor((days - 1) / 365);

        days =
            (days - 1) % 365;
    }

    let gd = days + 1;

    const monthDays = [
        31,
        28,
        31,
        30,
        31,
        30,
        31,
        31,
        30,
        31,
        30,
        31
    ];

    const leap =
        (gy % 4 === 0 && gy % 100 !== 0) ||
        (gy % 400 === 0);

    if (leap) {
        monthDays[1] = 29;
    }

    let gm = 0;

    while (
        gm < 12 &&
        gd > monthDays[gm]
    ) {

        gd -= monthDays[gm];
        gm++;
    }

    return {
        year: gy,
        month: gm + 1,
        day: gd
    };
}


// ================= تبدیل میلادی به شمسی =================

function gregorianToJalali(gy, gm, gd) {

    const gDaysInMonth = [
        31,
        28,
        31,
        30,
        31,
        30,
        31,
        31,
        30,
        31,
        30,
        31
    ];

    const jDaysInMonth = [
        31,
        31,
        31,
        31,
        31,
        31,
        30,
        30,
        30,
        30,
        30,
        29
    ];

    let gy2 = gy - 1600;
    let gm2 = gm - 1;
    let gd2 = gd - 1;

    let days =
        365 * gy2 +
        Math.floor((gy2 + 3) / 4) -
        Math.floor((gy2 + 99) / 100) +
        Math.floor((gy2 + 399) / 400);

    for (let i = 0; i < gm2; i++) {
        days += gDaysInMonth[i];
    }

    if (
        gm2 > 1 &&
        (
            (gy % 4 === 0 && gy % 100 !== 0) ||
            (gy % 400 === 0)
        )
    ) {
        days++;
    }

    days += gd2;

    let jy =
        979 +
        33 * Math.floor(days / 12053);

    days %= 12053;

    jy +=
        4 * Math.floor(days / 1461);

    days %= 1461;

    if (days > 365) {

        jy +=
            Math.floor((days - 1) / 365);

        days =
            (days - 1) % 365;
    }

    let jm = 0;

    while (
        jm < 11 &&
        days >= jDaysInMonth[jm]
    ) {

        days -= jDaysInMonth[jm];
        jm++;
    }

    let jd = days + 1;

    return {
        year: jy,
        month: jm + 1,
        day: jd
    };
}


// ================= تبدیل میلادی به قمری =================

function gregorianToHijri(date) {

    const formatter =
        new Intl.DateTimeFormat(
            "en-US-u-ca-islamic",
            {
                year: "numeric",
                month: "numeric",
                day: "numeric"
            }
        );

    const parts =
        formatter.formatToParts(date);

    let year;
    let month;
    let day;

    parts.forEach(part => {

        if (part.type === "year") {
            year = Number(part.value);
        }

        if (part.type === "month") {
            month = Number(part.value);
        }

        if (part.type === "day") {
            day = Number(part.value);
        }

    });

    return {
        year,
        month,
        day
    };
}


// ================= تبدیل قمری به میلادی =================

function hijriToGregorian(hy, hm, hd) {

    const epoch =
        new Date(Date.UTC(622, 6, 19));

    const days =
        Math.floor(
            (11 * hy + 3) / 30
        ) +
        354 * (hy - 1) +
        30 * (hm - 1) -
        Math.floor((hm - 1) / 2) +
        hd -
        1;

    const result =
        new Date(
            epoch.getTime() +
            days * 86400000
        );

    return {
        year: result.getUTCFullYear(),
        month: result.getUTCMonth() + 1,
        day: result.getUTCDate()
    };
}


// ================= اعتبارسنجی تاریخ =================

function isValidDate(year, month, day) {

    if (
        !Number.isInteger(year) ||
        !Number.isInteger(month) ||
        !Number.isInteger(day)
    ) {
        return false;
    }

    if (
        month < 1 ||
        month > 12 ||
        day < 1
    ) {
        return false;
    }

    return true;
}


// ================= دکمه تبدیل =================

if (calculateDate) {

    calculateDate.addEventListener("click", () => {

        const year =
            Number(dateYear.value);

        const month =
            Number(dateMonth.value);

        const day =
            Number(dateDay.value);


        // بررسی خالی نبودن ورودی‌ها

        if (
            !dateYear.value ||
            !dateMonth.value ||
            !dateDay.value
        ) {

            alert(
                translateKey("alert_date_missing")
            );

            return;
        }


        // بررسی معتبر بودن عددها

        if (
            !isValidDate(
                year,
                month,
                day
            )
        ) {

            alert(
                translateKey("alert_date_invalid")
            );

            return;
        }


        let jalali;
        let gregorian;
        let hijri;


        // ================= شمسی =================

        if (
            selectedCalendar === "jalali"
        ) {

            jalali = {
                year,
                month,
                day
            };

            gregorian =
                jalaliToGregorian(
                    year,
                    month,
                    day
                );

            hijri =
                gregorianToHijri(
                    new Date(
                        gregorian.year,
                        gregorian.month - 1,
                        gregorian.day
                    )
                );
        }


        // ================= میلادی =================

        else if (
            selectedCalendar === "gregorian"
        ) {

            gregorian = {
                year,
                month,
                day
            };

            jalali =
                gregorianToJalali(
                    year,
                    month,
                    day
                );

            hijri =
                gregorianToHijri(
                    new Date(
                        year,
                        month - 1,
                        day
                    )
                );
        }


        // ================= قمری =================

        else if (
            selectedCalendar === "hijri"
        ) {

            hijri = {
                year,
                month,
                day
            };

            gregorian =
                hijriToGregorian(
                    year,
                    month,
                    day
                );

            jalali =
                gregorianToJalali(
                    gregorian.year,
                    gregorian.month,
                    gregorian.day
                );
        }


        // ================= نمایش نتیجه =================

        if (jalaliResult) {

            jalaliResult.textContent =
                `${jalali.year}/${jalali.month}/${jalali.day}`;
        }

        if (gregorianResult) {

            gregorianResult.textContent =
                `${gregorian.year}/${gregorian.month}/${gregorian.day}`;
        }

        if (hijriResult) {

            hijriResult.textContent =
                `${hijri.year}/${hijri.month}/${hijri.day}`;
        }


        // نمایش کارت نتیجه

        if (dateResult) {

            dateResult.classList.add("show");
        }

    });

}


// ===============================
// UNIT CONVERTER PAGE
// ===============================

const toolsUnit = document.getElementById("toolsUnit");
const unitPage = document.getElementById("unitPage");
const unitBack = document.getElementById("unitBack");


// ===============================
// باز کردن صفحه تبدیل واحد
// ===============================

if (toolsUnit) {

    toolsUnit.addEventListener("click", () => {

        currentPage = "tools";

        // مخفی کردن همه صفحات
        hideAllPages();

        // مخفی کردن صفحه ابزارها
        closeToolsPage();

        // نمایش صفحه تبدیل واحد
        unitPage.classList.add("show");

        // رفتن به بالای صفحه
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

    });

}


// ===============================
// بازگشت از صفحه تبدیل واحد
// ===============================

if (unitBack) {

    unitBack.addEventListener("click", () => {

        // مخفی کردن صفحه تبدیل واحد
        unitPage.classList.remove("show");

        // نمایش صفحه ابزارها
        toolsPage.classList.add("show");

        // رفتن به بالای صفحه
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

    });

}


// ===============================
// UNIT CONVERTER LOGIC
// ===============================

const unitValue =
    document.getElementById("unitValue");

const unitFrom =
    document.getElementById("unitFrom");

const unitTo =
    document.getElementById("unitTo");

const calculateUnit =
    document.getElementById("calculateUnit");

const unitResult =
    document.getElementById("unitResult");

const unitResultValue =
    document.getElementById("unitResultValue");

const unitTypes =
    document.querySelectorAll(".unit-type");


// ===============================
// واحدها و ضرایب تبدیل
// ===============================

const conversionRates = {

    // طول
    length: {

        meter: 1,

        kilometer: 1000,

        centimeter: 0.01,

        millimeter: 0.001

    },


    // وزن
    weight: {

        kilogram: 1,

        gram: 0.001,

        milligram: 0.000001,

        ton: 1000

    },


    // حجم
    volume: {

        liter: 1,

        milliliter: 0.001,

        cubicMeter: 1000

    },


    // دما
    temperature: {

        celsius: 1,

        fahrenheit: 1,

        kelvin: 1

    }

};


// ===============================
// نام فارسی واحدها
// ===============================

const unitNames = {
    fa: {
        length: { meter: "متر", kilometer: "کیلومتر", centimeter: "سانتی‌متر", millimeter: "میلی‌متر" },
        weight: { kilogram: "کیلوگرم", gram: "گرم", milligram: "میلی‌گرم", ton: "تن" },
        volume: { liter: "لیتر", milliliter: "میلی‌لیتر", cubicMeter: "متر مکعب" },
        temperature: { celsius: "سلسیوس", fahrenheit: "فارنهایت", kelvin: "کلوین" }
    },
    en: {
        length: { meter: "Meter", kilometer: "Kilometer", centimeter: "Centimeter", millimeter: "Millimeter" },
        weight: { kilogram: "Kilogram", gram: "Gram", milligram: "Milligram", ton: "Ton" },
        volume: { liter: "Liter", milliliter: "Milliliter", cubicMeter: "Cubic meter" },
        temperature: { celsius: "Celsius", fahrenheit: "Fahrenheit", kelvin: "Kelvin" }
    }
};


// ===============================
// نوع واحد فعلی
// ===============================

let currentUnitType = "length";


// ===============================
// ساخت گزینه‌های Select
// ===============================

function updateUnitOptions() {

    // پاک کردن گزینه‌های قبلی
    unitFrom.innerHTML = "";
    unitTo.innerHTML = "";


    // گرفتن واحدهای مربوط به نوع انتخاب‌شده
    const units =
        conversionRates[currentUnitType];
    const lang = document.documentElement.lang === "en" ? "en" : "fa";
    const labels = unitNames[lang][currentUnitType];


    // ساخت گزینه‌ها
    Object.keys(units).forEach(unit => {

        // ---------------------------
        // Select مبدا
        // ---------------------------

        const optionFrom =
            document.createElement("option");

        optionFrom.value = unit;

        optionFrom.textContent =
            labels[unit];

        unitFrom.appendChild(optionFrom);


        // ---------------------------
        // Select مقصد
        // ---------------------------

        const optionTo =
            document.createElement("option");

        optionTo.value = unit;

        optionTo.textContent =
            labels[unit];

        unitTo.appendChild(optionTo);

    });


    // ---------------------------
    // انتخاب پیش‌فرض
    // ---------------------------

    if (unitFrom.options.length > 0) {

        unitFrom.selectedIndex = 0;

    }


    if (unitTo.options.length > 1) {

        unitTo.selectedIndex = 1;

    }


    else if (unitTo.options.length > 0) {

        unitTo.selectedIndex = 0;

    }

}


// ===============================
// نمایش نتیجه
// ===============================

function showUnitResult(result) {

    // نمایش عدد
    unitResultValue.textContent =
        result.toLocaleString("fa-IR", {
            maximumFractionDigits: 10
        });


    // نمایش کارت نتیجه
    unitResult.classList.add("show");

}


// ===============================
// تغییر نوع واحد
// ===============================

unitTypes.forEach(button => {

    button.addEventListener("click", () => {


        // حذف active از همه
        unitTypes.forEach(btn => {

            btn.classList.remove("active");

        });


        // فعال کردن گزینه انتخاب‌شده
        button.classList.add("active");


        // ذخیره نوع واحد
        currentUnitType =
            button.dataset.unit;


        // ساخت دوباره Selectها
        updateUnitOptions();


        // پاک کردن ورودی
        unitValue.value = "";


        // پاک کردن نتیجه
        unitResultValue.textContent = "0";


        // مخفی کردن نتیجه قبلی
        unitResult.classList.remove("show");

    });

});


// ===============================
// دکمه تبدیل
// ===============================

if (calculateUnit) {

    calculateUnit.addEventListener("click", () => {


        // گرفتن مقدار
        const value =
            Number(unitValue.value);


        // ---------------------------
        // بررسی ورودی
        // ---------------------------

        if (
            unitValue.value.trim() === "" ||
            !Number.isFinite(value)
        ) {

            alert(
                translateKey("alert_unit")
            );

            return;

        }


        // گرفتن واحد مبدا و مقصد
        const from =
            unitFrom.value;

        const to =
            unitTo.value;


        // ===============================
        // تبدیل دما
        // ===============================

        if (
            currentUnitType === "temperature"
        ) {


            let celsius;


            // ---------------------------
            // مبدا → سلسیوس
            // ---------------------------

            if (from === "celsius") {

                celsius = value;

            }

            else if (from === "fahrenheit") {

                celsius =
                    (value - 32) * 5 / 9;

            }

            else if (from === "kelvin") {

                celsius =
                    value - 273.15;

            }


            // ---------------------------
            // سلسیوس → مقصد
            // ---------------------------

            let result;


            if (to === "celsius") {

                result = celsius;

            }

            else if (to === "fahrenheit") {

                result =
                    (celsius * 9 / 5) + 32;

            }

            else if (to === "kelvin") {

                result =
                    celsius + 273.15;

            }


            // نمایش نتیجه
            showUnitResult(result);

            return;

        }


        // ===============================
        // تبدیل واحدهای معمولی
        // ===============================


        const fromRate =
            conversionRates[currentUnitType][from];


        const toRate =
            conversionRates[currentUnitType][to];


        // تبدیل مقدار به واحد پایه
        const baseValue =
            value * fromRate;


        // تبدیل واحد پایه به مقصد
        const result =
            baseValue / toRate;


        // نمایش نتیجه
        showUnitResult(result);

    });

}


// ===============================
// اجرای اولیه
// ===============================

updateUnitOptions();

// ================= PERCENTAGE PAGE =================

const toolsPercentage = document.getElementById("toolsPercentage");
const percentagePage = document.getElementById("percentagePage");
const percentageBack = document.getElementById("percentageBack");


// ===============================
// باز کردن صفحه محاسبه درصد
// ===============================

toolsPercentage.addEventListener("click", () => {

    currentPage = "tools";

    // مخفی کردن همه صفحات
    hideAllPages();

    // مخفی کردن صفحه ابزارها
    closeToolsPage();

    // نمایش صفحه محاسبه درصد
    percentagePage.classList.add("show");

    // رفتن به بالای صفحه
    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

});


// ===============================
// بازگشت از صفحه درصد
// ===============================

percentageBack.addEventListener("click", () => {

    percentagePage.classList.remove("show");

    // برگشت به صفحه ابزارها
    toolsPage.classList.add("show");

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

});


// ===============================
// عناصر محاسبه درصد
// ===============================

const percentageValue =
    document.getElementById("percentageValue");

const percentageNumber =
    document.getElementById("percentageNumber");

const calculatePercentage =
    document.getElementById("calculatePercentage");

const percentageResult =
    document.getElementById("percentageResult");

const percentageResultValue =
    document.getElementById("percentageResultValue");


// ===============================
// محاسبه درصد
// ===============================

calculatePercentage.addEventListener("click", () => {

    const percentage =
        Number(percentageValue.value);

    const number =
        Number(percentageNumber.value);


    // بررسی ورودی‌ها
    if (
        percentageValue.value.trim() === "" ||
        percentageNumber.value.trim() === "" ||
        !Number.isFinite(percentage) ||
        !Number.isFinite(number)
    ) {

        alert(translateKey("alert_percentage"));

        return;
    }


    // محاسبه درصد
    // مثال:
    // 20 درصد از 500
    // 20 ÷ 100 × 500 = 100

    const result =
        (percentage / 100) * number;


    // نمایش نتیجه
    percentageResultValue.textContent =
        result.toLocaleString("fa-IR", {
            maximumFractionDigits: 10
        });

});

/* ================= TIME PAGE ================= */

const toolsTime = document.getElementById("toolsTime");
const timePage = document.getElementById("timePage");
const timeBack = document.getElementById("timeBack");



// ===============================
// باز کردن صفحه تبدیل زمان
// ===============================

if (toolsTime) {

    toolsTime.addEventListener("click", () => {

        currentPage = "tools";

        // مخفی کردن تمام صفحات
        hideAllPages();

        // مخفی کردن صفحه ابزارها
        closeToolsPage();

        // نمایش صفحه تبدیل زمان
        timePage.classList.add("show");

        // رفتن به بالای صفحه
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

    });

}


// ===============================
// بازگشت از صفحه تبدیل زمان
// ===============================

if (timeBack) {

    timeBack.addEventListener("click", () => {

        // مخفی کردن صفحه زمان
        timePage.classList.remove("show");

        // نمایش صفحه ابزارها
        toolsPage.classList.add("show");

        // رفتن به بالای صفحه
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

    });

}


/* ================= TIME CONVERTER ================= */

// ورودی مقدار
const timeValue =
    document.getElementById("timeValue");

// واحد مبدا
const timeFrom =
    document.getElementById("timeFrom");

// واحد مقصد
const timeTo =
    document.getElementById("timeTo");

// دکمه تبدیل
const calculateTimeBtn =
    document.getElementById("calculateTimeBtn");

// کارت نتیجه
const timeResult =
    document.getElementById("timeResult");

// مقدار نتیجه
const timeResultValue =
    document.getElementById("timeResultValue");


// ===============================
// ضریب تبدیل واحدهای زمان
// ===============================

const timeConversionRates = {

    second: 1,

    minute: 60,

    hour: 60 * 60,

    day: 24 * 60 * 60

};


// ===============================
// نام فارسی واحدهای زمان
// ===============================

const timeUnitNames = {
    fa: { second: "ثانیه", minute: "دقیقه", hour: "ساعت", day: "روز" },
    en: { second: "seconds", minute: "minutes", hour: "hours", day: "days" }
};


// ===============================
// تبدیل زمان
// ===============================

if (calculateTimeBtn) {

    calculateTimeBtn.addEventListener("click", () => {

        // گرفتن مقدار واردشده
        const value =
            Number(timeValue.value);


        // ===============================
        // بررسی ورودی
        // ===============================

        if (
            timeValue.value.trim() === "" ||
            !Number.isFinite(value)
        ) {

            alert(
                translateKey("alert_time")
            );

            timeResult.classList.remove("show");

            return;
        }


        // ===============================
        // واحد مبدا و مقصد
        // ===============================

        const from =
            timeFrom.value;

        const to =
            timeTo.value;


        // ===============================
        // تبدیل مقدار به ثانیه
        // ===============================

        const seconds =
            value * timeConversionRates[from];


        // ===============================
        // تبدیل ثانیه به واحد مقصد
        // ===============================

        const result =
            seconds / timeConversionRates[to];


        // ===============================
        // حذف اعشارهای اضافی
        // ===============================

        const cleanResult =
            Number(result.toFixed(10));


        // ===============================
        // نمایش نتیجه
        // ===============================

        timeResultValue.textContent =
            `${cleanResult.toLocaleString(document.documentElement.lang === "en" ? "en" : "fa-IR")} ${timeUnitNames[document.documentElement.lang === "en" ? "en" : "fa"][to]}`;

        // نمایش کارت نتیجه
        timeResult.classList.add("show");

    });
}

/* ================= SIDEBAR ================= */
const sidebar = document.getElementById("sidebar");
const sidebarToggle = document.getElementById("sidebarToggle");
const sidebarOverlay = document.getElementById("sidebarOverlay");
const sidebarClose = document.getElementById("sidebarClose");
const sidebarItems = document.querySelectorAll(".sidebar-item");

let sidebarCloseTimer = null;

function isMobileSidebar() {
    return window.matchMedia("(max-width: 899px)").matches;
}

function openSidebar() {
    if (!sidebar) return;
    if (sidebarCloseTimer) {
        clearTimeout(sidebarCloseTimer);
        sidebarCloseTimer = null;
    }
    sidebar.classList.remove("is-closing");
    sidebar.classList.add("open");
    document.body.classList.add("sidebar-open");
    if (isMobileSidebar() && sidebarOverlay) sidebarOverlay.classList.add("show");
    if (sidebarToggle) sidebarToggle.style.display = "none";
}

function closeSidebar() {
    if (!sidebar) return;
    // Close sidebar and content layout simultaneously (same transition).
    if (sidebarCloseTimer) {
        clearTimeout(sidebarCloseTimer);
        sidebarCloseTimer = null;
    }
    sidebar.classList.remove("is-closing");
    sidebar.classList.remove("open");
    document.body.classList.remove("sidebar-open");
    if (sidebarOverlay) sidebarOverlay.classList.remove("show");
    if (sidebarToggle) sidebarToggle.style.display = "";
}

if (sidebarToggle) sidebarToggle.addEventListener("click", () => {
    if (sidebar?.classList.contains("open") && !sidebar.classList.contains("is-closing")) {
        // toggle only closes on mobile via hamburger; on desktop hamburger opens
        if (isMobileSidebar()) closeSidebar();
        else openSidebar();
    } else {
        openSidebar();
    }
});
if (sidebarClose) sidebarClose.addEventListener("click", closeSidebar);
if (sidebarOverlay) sidebarOverlay.addEventListener("click", () => {
    if (isMobileSidebar()) closeSidebar();
});
document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeSidebar();
});

window.addEventListener("resize", () => {
    if (!sidebar) return;
    if (isMobileSidebar()) {
        if (sidebarOverlay) sidebarOverlay.classList.toggle("show", sidebar.classList.contains("open") && !sidebar.classList.contains("is-closing"));
        if (!sidebar.classList.contains("open")) {
            document.body.classList.remove("sidebar-open");
            if (sidebarToggle) sidebarToggle.style.display = "";
        }
    } else {
        // Desktop: keep current open/closed state; no overlay
        if (sidebarOverlay) sidebarOverlay.classList.remove("show");
        if (sidebar.classList.contains("open") && !sidebar.classList.contains("is-closing")) {
            document.body.classList.add("sidebar-open");
            if (sidebarToggle) sidebarToggle.style.display = "none";
        } else {
            document.body.classList.remove("sidebar-open");
            if (sidebarToggle) sidebarToggle.style.display = "";
        }
    }
});

function setActiveSidebar(nav) {
    document.querySelectorAll(".sidebar-item").forEach((item) => {
        item.classList.toggle("active", item.dataset.nav === nav);
    });
}

function goHome() {
    hideAllPages();
    const header = document.querySelector(".header");
    const welcome = document.querySelector(".welcome-card");
    const toolsSec = document.querySelector(".tools-section");
    const learning = document.querySelector(".learning-card");
    if (header) header.style.display = "flex";
    if (welcome) welcome.style.display = "flex";
    if (toolsSec) toolsSec.style.display = "block";
    if (learning) learning.style.display = "flex";
    setActiveSidebar("home");
    if (typeof isMobileSidebar === "function" && isMobileSidebar()) closeSidebar();
    window.scrollTo({ top: 0, behavior: "smooth" });
}

function openToolsFromSidebar() {
    currentPage = "tools";
    hideAllPages();
    document.querySelector(".header") && (document.querySelector(".header").style.display = "none");
    document.querySelector(".welcome-card") && (document.querySelector(".welcome-card").style.display = "none");
    document.querySelector(".tools-section") && (document.querySelector(".tools-section").style.display = "none");
    document.querySelector(".learning-card") && (document.querySelector(".learning-card").style.display = "none");
    if (toolsPage) toolsPage.classList.add("show");
    setActiveSidebar("tools");
    if (typeof isMobileSidebar === "function" && isMobileSidebar()) closeSidebar();
    window.scrollTo({ top: 0, behavior: "smooth" });
}

function openPageFromSidebar(pageId, navKey) {
    hideAllPages();
    document.querySelector(".header") && (document.querySelector(".header").style.display = "none");
    document.querySelector(".welcome-card") && (document.querySelector(".welcome-card").style.display = "none");
    document.querySelector(".tools-section") && (document.querySelector(".tools-section").style.display = "none");
    document.querySelector(".learning-card") && (document.querySelector(".learning-card").style.display = "none");
    const page = document.getElementById(pageId);
    if (page) page.classList.add("show");
    setActiveSidebar(navKey);
    if (typeof isMobileSidebar === "function" && isMobileSidebar()) closeSidebar();
    window.scrollTo({ top: 0, behavior: "smooth" });
}

document.getElementById("sidebarHome")?.addEventListener("click", goHome);
document.getElementById("sidebarTools")?.addEventListener("click", openToolsFromSidebar);

/* Collapsible Real World submenu */
const realworldToggle = document.getElementById("sidebarRealWorldToggle");
const realworldSubmenu = document.getElementById("realworldSubmenu");
if (realworldToggle && realworldSubmenu) {
    realworldToggle.addEventListener("click", () => {
        const isOpen = realworldSubmenu.classList.toggle("open");
        realworldToggle.classList.toggle("expanded", isOpen);
    });
}

document.getElementById("sidebarPaint")?.addEventListener("click", () => openPageFromSidebar("paintPage", "paint"));
document.getElementById("sidebarShopping")?.addEventListener("click", () => openPageFromSidebar("shoppingPage", "shopping"));
document.getElementById("sidebarDiscount")?.addEventListener("click", () => openPageFromSidebar("discountPage", "discount"));
document.getElementById("sidebarMeasurement")?.addEventListener("click", () => openPageFromSidebar("measurementPage", "measurement"));
document.getElementById("sidebarSchool")?.addEventListener("click", () => openPageFromSidebar("schoolPage", "school"));

document.getElementById("sidebarSettings")?.addEventListener("click", () => {
    openPageFromSidebar("settingsPage", "settings");
});
document.getElementById("sidebarAbout")?.addEventListener("click", () => {
    openPageFromSidebar("aboutPage", "about");
});

/* ================= PAINT ================= */
document.getElementById("paintBack")?.addEventListener("click", () => {
    document.getElementById("paintPage")?.classList.remove("show");
    goHome();
});
document.getElementById("calculatePaint")?.addEventListener("click", () => {
    const W = Number(document.getElementById("paintWidth")?.value);
    const H = Number(document.getElementById("paintHeight")?.value);
    const openings = Number(document.getElementById("paintOpenings")?.value) || 0;
    const coats = Number(document.getElementById("paintCoats")?.value) || 1;
    const coverage = Number(document.getElementById("paintCoverage")?.value) || 10;
    if (!W || !H || W <= 0 || H <= 0 || coverage <= 0) {
        alert(translateKey("alert_paint"));
        return;
    }
    const totalArea = W * H;
    const paintable = Math.max(0, totalArea - openings);
    const withCoats = paintable * coats;
    const liters = withCoats / coverage;
    document.getElementById("paintLiters").textContent =
        (currentLang === "en" ? "About " : "حدود ") +
        liters.toLocaleString(currentLang === "en" ? "en" : "fa-IR", { maximumFractionDigits: 2 }) +
        (currentLang === "en" ? " liters needed." : " لیتر رنگ لازم است.");
    document.getElementById("paintSteps").innerHTML = `
        <div class="step">${currentLang === "en" ? "Step 1" : "مرحله ۱"} — ${W} × ${H} = ${totalArea.toFixed(2)}</div>
        <div class="step">${currentLang === "en" ? "Step 2" : "مرحله ۲"} — ${totalArea.toFixed(2)} − ${openings} = ${paintable.toFixed(2)}</div>
        <div class="step">${currentLang === "en" ? "Step 3" : "مرحله ۳"} — ${paintable.toFixed(2)} × ${coats} = ${withCoats.toFixed(2)}</div>
        <div class="step">${currentLang === "en" ? "Step 4" : "مرحله ۴"} — ${withCoats.toFixed(2)} ÷ ${coverage} = ${liters.toFixed(2)}</div>
    `;
    document.getElementById("paintResult").classList.add("show");
});

/* ================= SHOPPING ================= */
document.getElementById("shoppingBack")?.addEventListener("click", () => {
    document.getElementById("shoppingPage")?.classList.remove("show");
    goHome();
});
document.getElementById("calculateShopping")?.addEventListener("click", () => {
    const price = Number(document.getElementById("shopPrice")?.value);
    const qty = Number(document.getElementById("shopQty")?.value);
    const disc = Number(document.getElementById("shopDiscount")?.value) || 0;
    if (!price || !qty || price <= 0 || qty <= 0) {
        alert(translateKey("alert_shopping"));
        return;
    }
    const subtotal = price * qty;
    const discountAmt = subtotal * (disc / 100);
    const final = subtotal - discountAmt;
    const loc = currentLang === "en" ? "en" : "fa-IR";
    document.getElementById("shopSubtotal").textContent = subtotal.toLocaleString(loc);
    document.getElementById("shopDiscountAmount").textContent = discountAmt.toLocaleString(loc);
    document.getElementById("shopTotal").textContent = final.toLocaleString(loc);
    document.getElementById("shopSteps").innerHTML = `
        <div class="step">${price.toLocaleString(loc)} × ${qty} = ${subtotal.toLocaleString(loc)}</div>
        <div class="step">${subtotal.toLocaleString(loc)} × ${disc}% = ${discountAmt.toLocaleString(loc)}</div>
        <div class="step">${subtotal.toLocaleString(loc)} − ${discountAmt.toLocaleString(loc)} = ${final.toLocaleString(loc)}</div>
    `;
    document.getElementById("shoppingResult").classList.add("show");
});

/* ================= DISCOUNT ================= */
document.getElementById("discountBack")?.addEventListener("click", () => {
    document.getElementById("discountPage")?.classList.remove("show");
    goHome();
});
document.getElementById("calculateDiscount")?.addEventListener("click", () => {
    const price = Number(document.getElementById("discountPrice")?.value);
    const pct = Number(document.getElementById("discountPercent")?.value);
    if (!price || price <= 0 || isNaN(pct) || pct < 0) {
        alert(translateKey("alert_discount"));
        return;
    }
    const amount = price * (pct / 100);
    const final = price - amount;
    const loc = currentLang === "en" ? "en" : "fa-IR";
    document.getElementById("discountAmount").textContent = amount.toLocaleString(loc);
    document.getElementById("discountFinal").textContent = final.toLocaleString(loc);
    document.getElementById("discountSteps").innerHTML = `
        <div class="step">${price.toLocaleString(loc)} × ${pct}% = ${amount.toLocaleString(loc)}</div>
        <div class="step">${price.toLocaleString(loc)} − ${amount.toLocaleString(loc)} = ${final.toLocaleString(loc)}</div>
    `;
    document.getElementById("discountResult").classList.add("show");
});

/* ================= MEASUREMENT ================= */
document.getElementById("measurementBack")?.addEventListener("click", () => {
    document.getElementById("measurementPage")?.classList.remove("show");
    goHome();
});
document.getElementById("calculateMeasurement")?.addEventListener("click", () => {
    const L = Number(document.getElementById("measLength")?.value);
    const W = Number(document.getElementById("measWidth")?.value);
    const Hval = document.getElementById("measHeight")?.value.trim();
    const H = Hval === "" ? null : Number(Hval);
    if (!L || !W || L <= 0 || W <= 0) {
        alert(translateKey("alert_measurement"));
        return;
    }
    const area = L * W;
    const perimeter = 2 * (L + W);
    document.getElementById("measArea").textContent = area.toFixed(2);
    document.getElementById("measPerimeter").textContent = perimeter.toFixed(2);
    let steps = `<div class="step">${L} × ${W} = ${area.toFixed(2)}</div><div class="step">2 × (${L} + ${W}) = ${perimeter.toFixed(2)}</div>`;
    if (H !== null && H > 0) {
        const volume = area * H;
        document.getElementById("measVolume").textContent = volume.toFixed(2);
        document.getElementById("measVolumeRow").style.display = "flex";
        steps += `<div class="step">${area.toFixed(2)} × ${H} = ${volume.toFixed(2)}</div>`;
    } else {
        document.getElementById("measVolumeRow").style.display = "none";
    }
    document.getElementById("measSteps").innerHTML = steps;
    document.getElementById("measurementResult").classList.add("show");
});

/* ================= SCHOOL ================= */
document.getElementById("schoolBack")?.addEventListener("click", () => {
    document.getElementById("schoolPage")?.classList.remove("show");
    goHome();
});
document.querySelectorAll(".school-tab").forEach((tab) => {
    tab.addEventListener("click", () => {
        document.querySelectorAll(".school-tab").forEach((t) => t.classList.remove("active"));
        tab.classList.add("active");
        const name = tab.dataset.tab;
        document.getElementById("schoolAverage").style.display = name === "average" ? "block" : "none";
        document.getElementById("schoolProportion").style.display = name === "proportion" ? "block" : "none";
        document.getElementById("schoolSpeed").style.display = name === "speed" ? "block" : "none";
        document.getElementById("schoolResult")?.classList.remove("show");
    });
});
document.getElementById("calcAverage")?.addEventListener("click", () => {
    const raw = document.getElementById("avgNumbers")?.value.trim();
    if (!raw) return alert("...");
    const nums = raw.split(/[,،\s]+/).map(Number).filter((n) => Number.isFinite(n));
    if (!nums.length) return;
    const sum = nums.reduce((a, b) => a + b, 0);
    const avg = sum / nums.length;
    document.getElementById("schoolSteps").innerHTML = `
        <div class="step">${nums.join(", ")}</div>
        <div class="step">Σ = ${sum}</div>
        <div class="step">n = ${nums.length}</div>
        <div class="step">avg = ${avg.toLocaleString(undefined, { maximumFractionDigits: 4 })}</div>
    `;
    document.getElementById("schoolResult").classList.add("show");
});
document.getElementById("calcProportion")?.addEventListener("click", () => {
    const a = Number(document.getElementById("propA")?.value);
    const b = Number(document.getElementById("propB")?.value);
    const c = Number(document.getElementById("propC")?.value);
    if (!a || !b || !c) return;
    const x = (b * c) / a;
    document.getElementById("schoolSteps").innerHTML = `
        <div class="step">x = (b × c) / a</div>
        <div class="step">x = (${b} × ${c}) / ${a} = ${x}</div>
    `;
    document.getElementById("schoolResult").classList.add("show");
});
document.getElementById("calcSpeed")?.addEventListener("click", () => {
    const s = document.getElementById("spdSpeed")?.value.trim() === "" ? null : Number(document.getElementById("spdSpeed").value);
    const t = document.getElementById("spdTime")?.value.trim() === "" ? null : Number(document.getElementById("spdTime").value);
    const d = document.getElementById("spdDist")?.value.trim() === "" ? null : Number(document.getElementById("spdDist").value);
    let html = "";
    if (s != null && t != null && d == null) html = `<div class="step">d = s × t = ${s * t}</div>`;
    else if (d != null && t != null && s == null && t) html = `<div class="step">s = d / t = ${d / t}</div>`;
    else if (d != null && s != null && t == null && s) html = `<div class="step">t = d / s = ${d / s}</div>`;
    else return alert("Enter exactly two values");
    document.getElementById("schoolSteps").innerHTML = html;
    document.getElementById("schoolResult").classList.add("show");
});

/* ================= ANIMATIONS TOGGLE ================= */
let animationsEnabled = localStorage.getItem("mathmateAnimations") !== "off";
function applyAnimations(on) {
    animationsEnabled = on;
    document.body.classList.toggle("no-animations", !on);
    localStorage.setItem("mathmateAnimations", on ? "on" : "off");
    document.getElementById("animOn")?.classList.toggle("active", on);
    document.getElementById("animOff")?.classList.toggle("active", !on);
}
applyAnimations(animationsEnabled);
document.getElementById("animOn")?.addEventListener("click", () => applyAnimations(true));
document.getElementById("animOff")?.addEventListener("click", () => applyAnimations(false));

/* ================= LANGUAGE TOGGLE ================= */
let currentLang = localStorage.getItem("mathmateLang") || "fa";
const domPhrasePairs = [
    ["همیار ریاضی", "MathMate"],
    ["خانه", "Home"], ["ابزارها", "Tools"], ["ریاضی در دنیای واقعی", "Real-World Math"], ["ابزارهای کاربردی", "Practical Tools"],
    ["رنگ‌آمیزی", "Paint"], ["خرید", "Shopping"], ["تخفیف", "Discount"], ["اندازه‌گیری", "Measurement"], ["مسائل مدرسه", "School Problems"], ["سایر", "Other"], ["تنظیمات", "Settings"], ["درباره ما", "About"],
    ["بازگشت", "Back"], ["برگشت", "Back"], ["ماشین حساب", "Calculator"], ["مضرب‌ها", "Multiples"], ["پیدا کردن مضرب‌ها", "Find Multiples"],
    ["یک عدد وارد کن تا مضرب‌های آن را پیدا کنیم.", "Enter a number to find its multiples."], ["عدد مورد نظر", "Number"], ["چند مضرب نمایش داده شود؟", "How many multiples should be shown?"], ["مضرب‌های عدد", "Multiples of the number"], ["نتیجه اینجا نمایش داده می‌شود", "The result will appear here."],
    ["محاسبه مساحت و محیط", "Calculate Area & Perimeter"], ["شکل مورد نظر را انتخاب کن و اندازه‌های آن را وارد کن.", "Select a shape and enter its dimensions."], ["مستطیل", "Rectangle"], ["مربع", "Square"], ["مثلث", "Triangle"], ["دایره", "Circle"], ["JavaScript این قسمت را تغییر می‌دهد", "JavaScript updates this section"], ["محاسبه کن", "Calculate"], ["مساحت", "Area"], ["محیط", "Perimeter"],
    ["محاسبه ب.م.م و ک.م.م", "Calculate GCD & LCM"], ["دو عدد وارد کن تا ب.م.م و ک.م.م آن‌ها را پیدا کنیم.", "Enter two numbers to find their GCD and LCM."], ["عدد اول", "First number"], ["عدد دوم", "Second number"], ["ب.م.م", "GCD"], ["ک.م.م", "LCM"],
    ["آموزش", "Learning"], ["دنبال چی می‌گردی؟", "What are you looking for?"], ["موضوع مورد نظرت را وارد کن تا فیلم‌های آموزشی مرتبط را پیدا کنیم.", "Enter a topic to find related educational videos."], ["موضوع آموزشی", "Educational topic"], ["جستجو در آپارات", "Search on Aparat"], ["جستجو در یوتیوب", "Search on YouTube"],
    ["شمارنده‌ها", "Factors"], ["پیدا کردن شمارنده‌ها", "Find Factors"], ["یک عدد وارد کن تا شمارنده‌های آن را پیدا کنیم.", "Enter a number to find its factors."], ["شمارنده‌های عدد", "Factors of the number"], ["نتیجه اینجا قرار می‌گیرد", "The result will appear here."],
    ["تبدیل تاریخ", "Date Converter"], ["تاریخ شمسی، میلادی یا قمری را وارد کن تا به تقویم‌های دیگر تبدیل شود.", "Enter a Jalali, Gregorian, or Hijri date to convert it to the other calendars."], ["شمسی", "Jalali"], ["میلادی", "Gregorian"], ["قمری", "Hijri"], ["سال", "Year"], ["ماه", "Month"], ["روز", "Day"], ["نتیجه تبدیل", "Conversion result"],
    ["تبدیل واحد", "Unit Converter"], ["مقدار مورد نظر را وارد کن و واحد آن را تبدیل کن.", "Enter a value and convert its unit."], ["طول", "Length"], ["وزن", "Weight"], ["حجم", "Volume"], ["دما", "Temperature"], ["مقدار", "Value"], ["تبدیل از", "Convert from"], ["تبدیل به", "Convert to"], ["نتیجه", "Result"],
    ["محاسبه درصد", "Percentage Calculator"], ["درصد و عدد مورد نظر را وارد کن تا مقدار درصد را حساب کنیم.", "Enter the percentage and number to calculate the result."], ["درصد مورد نظر", "Percentage"], ["عدد", "Number"],
    ["تبدیل زمان", "Time Converter"], ["زمان را به‌سادگی بین ثانیه، دقیقه، ساعت و روز تبدیل کنید.", "Easily convert time between seconds, minutes, hours, and days."], ["از", "From"], ["به", "To"], ["نتیجه تبدیل:", "Conversion result:"],
    ["رنگ‌آمیزی دیوار", "Wall Painting"], ["محاسبه رنگ دیوار", "Calculate Wall Paint"], ["عرض، ارتفاع، مساحت بازشوها و تعداد دست رنگ را وارد کن.", "Enter the width, height, openings area, and number of coats."], ["عرض دیوار (متر)", "Wall width (m)"], ["ارتفاع دیوار (متر)", "Wall height (m)"], ["مساحت در و پنجره (متر مربع)", "Door and window area (m²)"], ["تعداد دست رنگ", "Number of coats"], ["پوشش هر لیتر رنگ (متر مربع)", "Coverage per liter (m²)"], ["رنگ مورد نیاز", "Required paint"],
    ["هزینه خرید", "Shopping Cost"], ["محاسبه هزینه خرید", "Calculate Shopping Cost"], ["قیمت، تعداد و درصد تخفیف را وارد کن.", "Enter the price, quantity, and discount percentage."], ["قیمت کالا (تومان)", "Item price (toman)"], ["تعداد", "Quantity"], ["درصد تخفیف", "Discount percentage"], ["قیمت اولیه", "Subtotal"], ["مبلغ تخفیف", "Discount amount"], ["قیمت نهایی", "Final price"],
    ["درصد و تخفیف", "Discount & Percentage"], ["محاسبه درصد و تخفیف", "Calculate Discount"], ["مبلغ و درصد را وارد کن تا مبلغ تخفیف و قیمت نهایی را ببینی.", "Enter the amount and percentage to see the discount and final price."], ["مبلغ (تومان)", "Amount (toman)"], ["درصد", "Percent"],
    ["محاسبه مساحت، محیط و حجم", "Calculate Area, Perimeter & Volume"], ["طول و عرض را وارد کن. ارتفاع اختیاری است.", "Enter the length and width. Height is optional."], ["طول (متر)", "Length (m)"], ["عرض (متر)", "Width (m)"], ["ارتفاع (متر) — اختیاری", "Height (m) — optional"], ["حجم", "Volume"],
    ["مسائل رایج مدرسه", "Common School Problems"], ["میانگین، تناسب یا سرعت/مسافت/زمان را انتخاب کن و اعداد را وارد کن.", "Choose average, proportion, or speed/distance/time and enter the numbers."], ["میانگین", "Average"], ["تناسب", "Proportion"], ["سرعت / مسافت", "Speed / Distance"], ["اعداد (با ویرگول جدا کن)", "Numbers (separate with commas)"], ["محاسبه میانگین", "Calculate Average"], ["فرمول: a / b = c / x x = (b × c) / a", "Formula: a / b = c / x  x = (b × c) / a"], ["محاسبه x", "Calculate x"], ["سرعت (اختیاری)", "Speed (optional)"], ["زمان (اختیاری)", "Time (optional)"], ["مسافت (اختیاری)", "Distance (optional)"], ["دو مقدار را وارد کن تا سومی محاسبه شود.", "Enter two values to calculate the third."],
    ["فیلم‌های آموزشی", "Educational Videos"], ["آموزش‌های ریاضی را ببین و بهتر یاد بگیر.", "Watch math lessons and learn better."], ["عنوان فیلم آموزشی", "Lesson title"], ["توضیح کوتاهی درباره این آموزش", "A short description of this lesson"],
    ["آواتار", "Avatar"], ["انتخاب آواتار", "Choose Avatar"], ["از آواتارهای پیش‌فرض یکی را انتخاب کن یا از دستگاه خودت یک عکس بگذار. عکس کامل با گوشه‌های گرد نمایش داده می‌شود.", "Choose a default avatar or upload a photo from your device. The full image is shown with rounded corners."], ["انتخاب از دستگاه", "Choose from device"], ["ذخیره آواتار", "Save Avatar"], ["آواتارهای پیش‌فرض", "Default Avatars"],
    ["اندازه نوشته‌ها", "Font Size"], ["اندازه متن‌های برنامه را انتخاب کن.", "Choose the app text size."], ["کوچک", "Small"], ["معمولی", "Normal"], ["بزرگ", "Large"], ["ظاهر برنامه", "Appearance"], ["حالت روشن یا تاریک را انتخاب کن.", "Choose light or dark mode."], ["روشن", "Light"], ["تاریک", "Dark"], ["تم رنگی", "Color Theme"], ["پالت رنگ برنامه را انتخاب کن.", "Choose the app color palette."], ["اینستاگرام", "Instagram"], ["صورتی و بنفش", "Pink & Purple"], ["آبی و بنفش", "Blue & Purple"], ["زبان", "Language"], ["زبان رابط کاربری را انتخاب کن.", "Choose the interface language."], ["فارسی", "Persian"], ["انیمیشن‌ها", "Animations"], ["انیمیشن‌های برنامه را روشن یا خاموش کن.", "Enable or disable app animations."], ["خاموش", "Off"], ["اطلاعات دستگاه", "Device Info"], ["سیستم عامل", "Operating System"], ["در حال تشخیص...", "Detecting..."], ["معماری سیستم", "System Architecture"], ["مرورگر", "Browser"],
    ["درباره همیار ریاضی", "About MathMate"], ["نسخه 3.0.0", "Version 3.0.0"], ["MathMate یک ابزار ساده و کاربردی برای کمک به انجام محاسبات ریاضی و یادگیری بهتر مفاهیم ریاضی است.", "MathMate is a simple and useful tool for calculations and learning math concepts."], ["امکانات برنامه", "Features"], ["محاسبه مضرب‌ها", "Calculate multiples"], ["پیدا کردن شمارنده‌ها", "Find factors"], ["محاسبه مساحت و محیط شکل‌ها", "Calculate area and perimeter of shapes"], ["جستجوی آموزش‌های ریاضی در آپارات و یوتیوب", "Search for math lessons on Aparat and YouTube"], ["تبدیل تاریخ شمسی، میلادی و قمری", "Convert Jalali, Gregorian, and Hijri dates"], ["تبدیل واحدهای طول، وزن، حجم و دما", "Convert length, weight, volume, and temperature units"], ["تبدیل واحدهای زمان", "Convert time units"], ["محاسبه درصد", "Calculate percentages"], ["محاسبه رنگ‌آمیزی دیوار", "Calculate wall paint"], ["محاسبه هزینه خرید", "Calculate shopping cost"], ["محاسبه تخفیف", "Calculate discount"], ["مسائل مدرسه با راه‌حل گام‌به‌گام", "School problems with step-by-step solutions"], ["حالت روشن و تاریک", "Light and dark mode"], ["تنظیم اندازه نوشته‌ها", "Adjust font size"], ["ذخیره تنظیمات با LocalStorage", "Save settings with LocalStorage"], ["نمایش اطلاعات دستگاه و مرورگر", "Show device and browser information"], ["سایدبار و نوار ناوبری", "Sidebar and navigation bar"], ["درباره نسخه", "About this version"], ["نسخه 3.0.0 یک نسخه جدیدتر و کامل‌تر از نسخه‌های اولیه MathMate است و با ظاهر بهتر، ابزارهای بیشتر و تنظیمات شخصی‌سازی ساخته شده.", "Version 3.0.0 is a newer and more complete version of the early MathMate releases, with a better interface, more tools, and personalization settings."],
    ["سلام!", "Hello!"], ["به همیار ریاضی خوش اومدی", "Welcome to MathMate"], ["آماده یادگیری؟", "Ready to learn?"], ["ریاضی رو راحت‌تر", "Learn math easier"], ["و جذاب‌تر یاد بگیر!", "and make it more fun!"], ["ابزارهای کاربردی ریاضی، ماشین حساب و آموزش، همه در یک جا.", "Practical math tools, a calculator, and learning resources — all in one place."], ["شروع کنیم", "Let's start"], ["همه ابزارها", "All tools"], ["آماده‌ای شروع کنی؟", "Ready to begin?"], ["یک ابزار انتخاب کن و شروع کن!", "Pick a tool and start!"],
    ["تغییر آواتار", "Change avatar"], ["پیش‌نمایش", "Preview"], ["تغییر حالت", "Toggle theme"], ["خطا", "Error"], ["نامشخص", "Unknown"],
    ["ثانیه", "seconds"], ["دقیقه", "minutes"], ["ساعت", "hours"], ["مثلاً 5", "e.g. 5"], ["مثلاً 10", "e.g. 10"], ["مثلاً 12", "e.g. 12"], ["مثلاً 18", "e.g. 18"], ["مثلاً آموزش کسر کلاس هفتم", "e.g. a seventh-grade fraction lesson"], ["مثلاً 24", "e.g. 24"], ["مثلاً 1405", "e.g. 1405"], ["مثلاً 20", "e.g. 20"], ["مثلاً 500", "e.g. 500"], ["مثلاً 120", "e.g. 120"], ["مثلاً 4", "e.g. 4"], ["مثلاً 3", "e.g. 3"], ["مثلاً 2", "e.g. 2"], ["مثلاً 50000", "e.g. 50000"], ["مثلاً 200000", "e.g. 200000"], ["مثلاً 200000", "e.g. 200000"], ["مثلاً 18, 17, 19, 16", "e.g. 18, 17, 19, 16"], ["مثلاً 60", "e.g. 60"], ["مثلاً 27", "e.g. 27"], ["مثلاً 6", "e.g. 6"],
    ["تقویم انتخاب شده:", "Selected calendar:"], ["Menu", "منو"], ["Close", "بستن"], ["English", "انگلیسی"],
];

const domPhraseFaToEn = new Map(domPhrasePairs.map(([fa, en]) => [fa, en]));
const domPhraseEnToFa = new Map(domPhrasePairs.map(([fa, en]) => [en, fa]));

function normalizeUiText(value) {
    return String(value).replace(/\s+/g, " ").trim();
}

function translateUiText(value, lang) {
    const normalized = normalizeUiText(value);
    if (!normalized) return null;
    const map = lang === "en" ? domPhraseFaToEn : domPhraseEnToFa;
    return map.get(normalized) || null;
}

function translateKey(key) {
    const lang = document.documentElement.lang === "en" ? "en" : "fa";
    return (i18n[lang] && i18n[lang][key]) || "";
}

const i18n = {
    fa: {
        app_name: "همیار ریاضی",
        home: "خانه", tools: "ابزارها", practical_tools: "ابزارهای کاربردی", paint: "رنگ‌آمیزی",
        shopping: "خرید", discount: "تخفیف", measurement: "اندازه‌گیری", school: "مسائل مدرسه",
        education: "آموزش", settings: "تنظیمات", about: "درباره ما",
        realworld_section: "ریاضی در دنیای واقعی", other: "سایر",
        language_title: "زبان", language_desc: "زبان رابط کاربری را انتخاب کن.",
        anim_title: "انیمیشن‌ها", anim_desc: "انیمیشن‌های برنامه را روشن یا خاموش کن.",
        device_title: "اطلاعات دستگاه", os_label: "سیستم عامل", arch_label: "معماری سیستم", browser_label: "مرورگر",
        back: "بازگشت",
        avatar_title: "آواتار", avatar_heading: "انتخاب آواتار",
        avatar_desc: "از آواتارهای پیش‌فرض یکی را انتخاب کن یا از دستگاه خودت یک عکس بگذار. عکس کامل با گوشه‌های گرد نمایش داده می‌شود.",
        avatar_upload: "انتخاب از دستگاه", avatar_save: "ذخیره آواتار", avatar_defaults: "آواتارهای پیش‌فرض",
        avatar_saved: "آواتار ذخیره شد!", avatar_fail: "ذخیره آواتار ممکن نشد.",
        font_size_title: "اندازه نوشته‌ها", font_size_desc: "اندازه متن‌های برنامه را انتخاب کن.",
        font_small: "کوچک", font_normal: "معمولی", font_large: "بزرگ",
        appearance_title: "ظاهر برنامه", appearance_desc: "حالت روشن یا تاریک را انتخاب کن.",
        theme_light: "روشن", theme_dark: "تاریک",
        color_theme_title: "تم رنگی", color_theme_desc: "پالت رنگ برنامه را انتخاب کن.",
        theme_instagram: "اینستاگرام", theme_pink: "صورتی و بنفش", theme_blue: "آبی و بنفش",
        hello: "سلام!", welcome_title: "به همیار ریاضی خوش اومدی",
        badge_ready: "آماده یادگیری؟", hero_line1: "ریاضی رو راحت‌تر", hero_line2: "و جذاب‌تر یاد بگیر!",
        hero_desc: "ابزارهای کاربردی ریاضی، ماشین حساب و آموزش، همه در یک جا.",
        start_btn: "شروع کنیم", tools_section_title: "ابزارهای همیار ریاضی", all_tools: "همه ابزارها",
        ready_start: "آماده‌ای شروع کنی؟", pick_tool: "یک ابزار انتخاب کن و شروع کن!",
        tools_page_title: "ابزارهای همیار ریاضی", tools_page_desc: "ابزار مورد نظرت را انتخاب کن و شروع کن.",
        about_title: "درباره همیار ریاضی",
        calc: "ماشین حساب", geometry: "مساحت و محیط", gcd_lcm: "ب.م.م و ک.م.م",
        multiples: "مضرب‌ها", learning: "آموزش", factors: "شمارنده‌ها",
        date_convert: "تبدیل تاریخ", unit_convert: "تبدیل واحد", percentage: "محاسبه درصد",
        time_convert: "تبدیل زمان",
        anim_on: "روشن", anim_off: "خاموش",
        features: "امکانات برنامه", version_about: "درباره نسخه",
        footer: "ساخته شده با ❤ و JavaScript توسط حسین ثقفی",
        desc_calc: "محاسبات سریع و آسان",
        desc_geometry: "محاسبه شکل‌های هندسی",
        desc_gcd: "محاسبه سریع اعداد",
        desc_multiples: "پیدا کردن مضرب‌های یک عدد",
        desc_multiples_short: "پیدا کردن مضرب‌ها",
        desc_learning: "جستجوی فیلم‌های آموزشی",
        desc_learning_short: "یادگیری آنلاین",
        desc_factors: "پیدا کردن شمارنده‌های یک عدد",
        desc_factors_short: "پیدا کردن شمارنده‌ها",
        desc_date: "تبدیل تاریخ شمسی، میلادی و قمری",
        desc_unit: "تبدیل واحدهای مختلف",
        desc_percentage: "محاسبه درصد یک عدد",
        desc_time: "تبدیل ثانیه، دقیقه، ساعت و روز",
        desc_paint: "محاسبه رنگ دیوار",
        desc_shopping: "محاسبه هزینه خرید",
        desc_discount: "محاسبه درصد و تخفیف",
        desc_measurement: "مساحت، محیط و حجم",
        desc_school: "میانگین، تناسب، سرعت",
        alert_calc_error: "خطا",
        alert_calc_both: "لطفاً هر دو قسمت را کامل کن",
        alert_calc_numbers: "لطفاً عددهای معتبر وارد کن",
        alert_geometry_rect: "لطفاً طول و عرض معتبر وارد کن",
        alert_geometry_square: "لطفاً اندازه ضلع معتبر وارد کن",
        alert_geometry_triangle: "لطفاً همه اندازه‌ها را درست وارد کن",
        alert_geometry_circle: "لطفاً شعاع معتبر وارد کن",
        alert_gcd: "لطفاً دو عدد صحیح و مثبت وارد کن",
        alert_learning: "اول موضوع آموزشی مورد نظرت را وارد کن",
        alert_factors: "لطفاً یک عدد صحیح و مثبت وارد کن",
        alert_date_missing: "لطفاً سال، ماه و روز را کامل وارد کن",
        alert_date_invalid: "تاریخ واردشده معتبر نیست",
        alert_unit: "لطفاً یک عدد معتبر وارد کن",
        alert_percentage: "لطفاً درصد و عدد را به‌درستی وارد کن",
        alert_time: "لطفاً یک مقدار معتبر وارد کن",
        alert_paint: "لطفاً عرض، ارتفاع و پوشش را درست وارد کن",
        alert_shopping: "لطفاً قیمت و تعداد معتبر وارد کن",
        alert_discount: "لطفاً مبلغ و درصد معتبر وارد کن",
        alert_measurement: "لطفاً طول و عرض معتبر وارد کن",
        alert_select_image: "لطفاً یک تصویر انتخاب کن."
    },
    en: {
        app_name: "MathMate",
        home: "Home", tools: "Tools", practical_tools: "Practical Tools", paint: "Paint",
        shopping: "Shopping", discount: "Discount", measurement: "Measurement", school: "School Problems",
        education: "Education", settings: "Settings", about: "About",
        realworld_section: "Real-World Math", other: "Other",
        language_title: "Language", language_desc: "Choose interface language.",
        anim_title: "Animations", anim_desc: "Enable or disable app animations.",
        device_title: "Device Info", os_label: "Operating System", arch_label: "Architecture", browser_label: "Browser",
        back: "Back",
        avatar_title: "Avatar", avatar_heading: "Choose Avatar",
        avatar_desc: "Pick a default avatar or upload a photo from your device. The full image is shown with rounded corners.",
        avatar_upload: "Choose from device", avatar_save: "Save avatar", avatar_defaults: "Default avatars",
        avatar_saved: "Avatar saved!", avatar_fail: "Could not save avatar.",
        font_size_title: "Font size", font_size_desc: "Choose the app text size.",
        font_small: "Small", font_normal: "Normal", font_large: "Large",
        appearance_title: "Appearance", appearance_desc: "Choose light or dark mode.",
        theme_light: "Light", theme_dark: "Dark",
        color_theme_title: "Color theme", color_theme_desc: "Choose the app color palette.",
        theme_instagram: "Instagram", theme_pink: "Pink & Purple", theme_blue: "Blue & Purple",
        hello: "Hello!", welcome_title: "Welcome to MathMate",
        badge_ready: "Ready to learn?", hero_line1: "Learn math easier", hero_line2: "and more fun!",
        hero_desc: "Practical math tools, calculator and lessons — all in one place.",
        start_btn: "Let's start", tools_section_title: "MathMate Tools", all_tools: "All tools",
        ready_start: "Ready to begin?", pick_tool: "Pick a tool and start!",
        tools_page_title: "MathMate Tools", tools_page_desc: "Choose a tool and get started.",
        about_title: "About MathMate",
        calc: "Calculator", geometry: "Area & Perimeter", gcd_lcm: "GCD & LCM",
        multiples: "Multiples", learning: "Learning", factors: "Factors",
        date_convert: "Date Convert", unit_convert: "Unit Convert", percentage: "Percentage",
        time_convert: "Time Convert",
        anim_on: "On", anim_off: "Off",
        features: "Features", version_about: "About this version",
        footer: "Made with ❤ and JavaScript by Hossein Saghafi",
        desc_calc: "Quick and easy calculations",
        desc_geometry: "Calculate geometric shapes",
        desc_gcd: "Quick number calculations",
        desc_multiples: "Find multiples of a number",
        desc_multiples_short: "Find multiples",
        desc_learning: "Search educational videos",
        desc_learning_short: "Online learning",
        desc_factors: "Find factors of a number",
        desc_factors_short: "Find factors",
        desc_date: "Convert Jalali, Gregorian and Hijri dates",
        desc_unit: "Convert various units",
        desc_percentage: "Calculate a percentage of a number",
        desc_time: "Convert seconds, minutes, hours and days",
        desc_paint: "Calculate wall paint",
        desc_shopping: "Calculate shopping cost",
        desc_discount: "Calculate percent and discount",
        desc_measurement: "Area, perimeter and volume",
        desc_school: "Average, proportion, speed",
        alert_calc_error: "Error",
        alert_calc_both: "Please complete both fields.",
        alert_calc_numbers: "Please enter valid numbers.",
        alert_geometry_rect: "Please enter valid length and width.",
        alert_geometry_square: "Please enter a valid side length.",
        alert_geometry_triangle: "Please enter all dimensions correctly.",
        alert_geometry_circle: "Please enter a valid radius.",
        alert_gcd: "Please enter two positive integers.",
        alert_learning: "Enter an educational topic first.",
        alert_factors: "Please enter a positive integer.",
        alert_date_missing: "Please enter year, month, and day.",
        alert_date_invalid: "The entered date is not valid.",
        alert_unit: "Please enter a valid number.",
        alert_percentage: "Please enter a valid percentage and number.",
        alert_time: "Please enter a valid value.",
        alert_paint: "Please enter valid width, height, and coverage.",
        alert_shopping: "Please enter valid price and quantity.",
        alert_discount: "Please enter a valid amount and percent.",
        alert_measurement: "Please enter valid length and width.",
        alert_select_image: "Please select an image."
    }
};

function applyLanguage(lang) {
    currentLang = lang;
    localStorage.setItem("mathmateLang", lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "fa" ? "rtl" : "ltr";
    const dict = i18n[lang] || i18n.fa;

    document.querySelectorAll("[data-i18n]").forEach((el) => {
        const key = el.getAttribute("data-i18n");
        if (dict[key] != null) el.textContent = dict[key];
    });

    document.querySelectorAll("[data-i18n-title]").forEach((el) => {
        const key = el.getAttribute("data-i18n-title");
        if (dict[key] != null) el.textContent = dict[key];
    });

    // Translate every remaining static phrase/placeholder so no Persian UI text
    // is left behind on pages that predate the data-i18n attributes.
    const phraseMap = lang === "en" ? domPhraseFaToEn : domPhraseEnToFa;
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    const textNodes = [];
    let node;
    while ((node = walker.nextNode())) {
        const parent = node.parentElement;
        if (!parent || parent.closest("script,style,noscript")) continue;
        textNodes.push(node);
    }
    textNodes.forEach((textNode) => {
        const normalized = normalizeUiText(textNode.nodeValue);
        if (!normalized) return;
        const translated = phraseMap.get(normalized);
        if (translated) {
            const leading = (textNode.nodeValue.match(/^\s*/) || [""])[0];
            const trailing = (textNode.nodeValue.match(/\s*$/) || [""])[0];
            textNode.nodeValue = leading + translated + trailing;
        }
    });

    const attrNames = ["placeholder", "title", "aria-label", "alt"];
    document.querySelectorAll("*").forEach((el) => {
        attrNames.forEach((attr) => {
            const value = el.getAttribute(attr);
            if (!value) return;
            const translated = phraseMap.get(normalizeUiText(value));
            if (translated) el.setAttribute(attr, translated);
        });
    });

    const appName = dict.app_name || "MathMate";
    document.title = appName;
    const st = document.getElementById("sidebarAppTitle");
    if (st) st.textContent = appName;
    const animOn = document.getElementById("animOn");
    const animOff = document.getElementById("animOff");
    if (animOn) animOn.textContent = dict.anim_on || "On";
    if (animOff) animOff.textContent = dict.anim_off || "Off";
    const langFaBtn = document.getElementById("langFa");
    const langEnBtn = document.getElementById("langEn");
    if (langFaBtn) langFaBtn.textContent = lang === "en" ? "Persian" : "فارسی";
    if (langEnBtn) langEnBtn.textContent = lang === "en" ? "English" : "انگلیسی";
    langFaBtn?.classList.toggle("active", lang === "fa");
    langEnBtn?.classList.toggle("active", lang === "en");

    // Re-apply labels generated after the initial page load.
    if (typeof updateUnitOptions === "function" && typeof unitFrom !== "undefined" && unitFrom) {
        const fromValue = unitFrom.value;
        const toValue = unitTo?.value;
        updateUnitOptions();
        if ([...unitFrom.options].some((o) => o.value === fromValue)) unitFrom.value = fromValue;
        if (toValue && [...unitTo.options].some((o) => o.value === toValue)) unitTo.value = toValue;
    }
    if (typeof updateThemeButtonIcon === "function") {
        const theme = document.body.classList.contains("dark") ? "dark" : "light";
        updateThemeButtonIcon(theme);
    }
}
applyLanguage(currentLang);
document.getElementById("langFa")?.addEventListener("click", () => applyLanguage("fa"));
document.getElementById("langEn")?.addEventListener("click", () => applyLanguage("en"));

/* Hide architecture on mobile already via CSS; ensure bottom-nav gone */
document.querySelectorAll(".bottom-nav").forEach((n) => (n.style.display = "none"));


function applyColorTheme(theme) {
  document.body.classList.remove("theme-instagram", "theme-pink-purple", "theme-blue-purple");
  document.body.classList.add("theme-" + theme);
  localStorage.setItem("mathmateColorTheme", theme);
  document.querySelectorAll(".color-theme-btn").forEach(function (btn) {
    btn.classList.toggle("active", btn.getAttribute("data-color-theme") === theme);
  });
}
var savedColorTheme = localStorage.getItem("mathmateColorTheme") || "instagram";
applyColorTheme(savedColorTheme);
document.querySelectorAll(".color-theme-btn").forEach(function (btn) {
  btn.addEventListener("click", function () {
    applyColorTheme(btn.getAttribute("data-color-theme"));
  });
});

function wireTool(id, pageId, nav) {
  var el = document.getElementById(id);
  if (!el) return;
  el.addEventListener("click", function () {
    if (typeof openPageFromSidebar === "function") openPageFromSidebar(pageId, nav);
  });
}
wireTool("toolsPaint", "paintPage", "paint");
wireTool("toolsShopping", "shoppingPage", "shopping");
wireTool("toolsDiscount", "discountPage", "discount");
wireTool("toolsMeasurement", "measurementPage", "measurement");
wireTool("toolsSchool", "schoolPage", "school");

// Desktop: start with sidebar open (like Win11 start), user can close with X
if (window.matchMedia("(min-width: 900px)").matches) {
  var sb = document.getElementById("sidebar");
  if (sb) {
    sb.classList.add("open");
    document.body.classList.add("sidebar-open");
    if (sidebarToggle) sidebarToggle.style.display = "none";
  }
}



/* ================= LEARNING CARD WHOLE CLICK ================= */
(function () {
    const learningCardEl = document.querySelector(".learning-card");
    if (learningCardEl && !learningCardEl.dataset.wired) {
        learningCardEl.dataset.wired = "1";
        learningCardEl.style.cursor = "pointer";
        learningCardEl.addEventListener("click", () => {
            currentPage = "tools";
            if (typeof activateToolsNav === "function") activateToolsNav();
            hideAllPages();
            const header = document.querySelector(".header");
            const welcome = document.querySelector(".welcome-card");
            const toolsSec = document.querySelector(".tools-section");
            const learning = document.querySelector(".learning-card");
            if (header) header.style.display = "none";
            if (welcome) welcome.style.display = "none";
            if (toolsSec) toolsSec.style.display = "none";
            if (learning) learning.style.display = "none";
            if (toolsPage) toolsPage.classList.add("show");
            if (typeof setActiveSidebar === "function") setActiveSidebar("tools");
            window.scrollTo({ top: 0, behavior: "smooth" });
        });
    }
})();



/* ================= AVATAR SYSTEM (simple, no crop/zoom) ================= */
(function () {
    const avatarPage = document.getElementById("avatarPage");
    const avatarBack = document.getElementById("avatarBack");
    const sidebarAvatarBtn = document.getElementById("sidebarAvatarBtn");
    const sidebarAvatarImg = document.getElementById("sidebarAvatarImg");
    const previewImg = document.getElementById("avatarPreviewImg");
    const fileInput = document.getElementById("avatarFileInput");
    const saveBtn = document.getElementById("avatarSaveBtn");
    const avatarGrid = document.getElementById("avatarGrid");

    let selectedSrc = localStorage.getItem("mathmateAvatar") || "assets/avatars/avatar1.png";

    function setPreview(src) {
        selectedSrc = src;
        if (previewImg) previewImg.src = src;
        document.querySelectorAll(".avatar-option").forEach((btn) => {
            btn.classList.toggle("active", btn.getAttribute("data-src") === src);
        });
    }

    function applyAvatarEverywhere(src) {
        if (sidebarAvatarImg) sidebarAvatarImg.src = src;
        const p = document.querySelector(".profile-icon");
        if (p) {
            p.innerHTML = "";
            const im = document.createElement("img");
            im.src = src;
            im.alt = "";
            p.appendChild(im);
        }
    }

    function openAvatarPage() {
        hideAllPages();
        document.querySelector(".header") && (document.querySelector(".header").style.display = "none");
        document.querySelector(".welcome-card") && (document.querySelector(".welcome-card").style.display = "none");
        document.querySelector(".tools-section") && (document.querySelector(".tools-section").style.display = "none");
        document.querySelector(".learning-card") && (document.querySelector(".learning-card").style.display = "none");
        if (avatarPage) avatarPage.classList.add("show");
        if (typeof isMobileSidebar === "function" && isMobileSidebar() && typeof closeSidebar === "function") closeSidebar();
        const saved = localStorage.getItem("mathmateAvatar") || "assets/avatars/avatar1.png";
        setPreview(saved);
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    if (sidebarAvatarBtn) {
        sidebarAvatarBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            openAvatarPage();
        });
    }
    if (avatarBack) {
        avatarBack.addEventListener("click", () => {
            if (avatarPage) avatarPage.classList.remove("show");
            if (typeof goHome === "function") goHome();
        });
    }
    if (avatarGrid) {
        avatarGrid.querySelectorAll(".avatar-option").forEach((btn) => {
            btn.addEventListener("click", () => {
                const src = btn.getAttribute("data-src");
                if (src) setPreview(src);
            });
        });
    }
    if (fileInput) {
        fileInput.addEventListener("change", () => {
            const file = fileInput.files && fileInput.files[0];
            if (!file) return;
            if (!file.type.startsWith("image/")) {
                alert(translateKey("alert_select_image"));
                return;
            }
            const reader = new FileReader();
            reader.onload = () => {
                setPreview(String(reader.result));
            };
            reader.readAsDataURL(file);
            fileInput.value = "";
        });
    }
    if (saveBtn) {
        saveBtn.addEventListener("click", () => {
            if (!selectedSrc) {
                alert((i18n[currentLang] && i18n[currentLang].avatar_fail) || "ذخیره آواتار ممکن نشد.");
                return;
            }
            try {
                localStorage.setItem("mathmateAvatar", selectedSrc);
                applyAvatarEverywhere(selectedSrc);
                alert((i18n[currentLang] && i18n[currentLang].avatar_saved) || "آواتار ذخیره شد!");
            } catch (err) {
                // localStorage quota for large dataURLs
                alert((i18n[currentLang] && i18n[currentLang].avatar_fail) || "ذخیره آواتار ممکن نشد.");
            }
        });
    }

    // Load on startup
    const saved = localStorage.getItem("mathmateAvatar");
    if (saved) applyAvatarEverywhere(saved);
})();

/* ================= MOBILE INSTALL BANNER ================= */
(function () {
    const banner = document.getElementById("mobileInstallBanner");
    const closeBtn = document.getElementById("mibClose");
    if (!banner || !closeBtn) return;

    const mibI18n = {
        fa: {
            title: "همیار ریاضی",
            sub: "همراه همه‌فن‌حریف ریاضی",
            myket: "دانلود از مایکت",
            bazaar: "دانلود از بازار"
        },
        en: {
            title: "MathMate",
            sub: "Your all-in-one math companion",
            myket: "Download from Myket",
            bazaar: "Download from Bazaar"
        }
    };

    function applyMibLang() {
        const lang = (document.documentElement.lang === "en") ? "en" : "fa";
        const t = mibI18n[lang];
        banner.querySelectorAll("[data-i18n-mib]").forEach((el) => {
            const key = el.getAttribute("data-i18n-mib");
            if (t[key]) el.textContent = t[key];
        });
    }

    function isMobileView() {
        return window.matchMedia("(max-width: 899px)").matches;
    }

    function showBanner() {
        if (!isMobileView()) return;
        applyMibLang();
        banner.setAttribute("aria-hidden", "false");
        // force reflow then show
        banner.style.display = "block";
        requestAnimationFrame(() => {
            banner.classList.remove("hiding");
            banner.classList.add("show");
        });
    }

    function hideBanner() {
        banner.classList.add("hiding");
        banner.classList.remove("show");
        banner.setAttribute("aria-hidden", "true");
        setTimeout(() => {
            if (!banner.classList.contains("show")) {
                banner.style.display = "none";
                banner.classList.remove("hiding");
            }
        }, 380);
    }

    closeBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        hideBanner();
    });

    // Show every visit on mobile (until user closes for this page load)
    function tryShow() {
        if (!isMobileView()) return;
        setTimeout(showBanner, 400);
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", tryShow);
    } else {
        tryShow();
    }

    // Re-apply text when language changes
    const origApply = window.applyLanguage;
    if (typeof applyLanguage === "function") {
        const _apply = applyLanguage;
        window.applyLanguage = function (lang) {
            _apply(lang);
            applyMibLang();
        };
        // also hook existing listeners already bound to applyLanguage - they call the local name
    }
    document.getElementById("langFa")?.addEventListener("click", () => setTimeout(applyMibLang, 50));
    document.getElementById("langEn")?.addEventListener("click", () => setTimeout(applyMibLang, 50));

    window.addEventListener("resize", () => {
        if (!isMobileView()) {
            banner.classList.remove("show", "hiding");
            banner.style.display = "none";
            banner.setAttribute("aria-hidden", "true");
        }
    });
})();

/* ================= SIDEBAR BODY SCROLL LOCK (mobile) ================= */
(function () {
    let lockedScrollY = 0;
    const body = document.body;

    function lockBody() {
        if (!window.matchMedia("(max-width: 899px)").matches) return;
        lockedScrollY = window.scrollY || window.pageYOffset || 0;
        body.style.top = `-${lockedScrollY}px`;
        body.classList.add("sidebar-open");
    }

    function unlockBody() {
        body.style.top = "";
        const y = lockedScrollY;
        // class removal handled by existing closeSidebar; restore scroll
        requestAnimationFrame(() => {
            window.scrollTo(0, y);
        });
    }

    // Patch existing open/close if present
    const sidebar = document.getElementById("sidebar");
    const toggle = document.getElementById("sidebarToggle");
    const closeBtn = document.getElementById("sidebarClose");
    const overlay = document.getElementById("sidebarOverlay");

    if (toggle) {
        toggle.addEventListener("click", () => {
            if (window.matchMedia("(max-width: 899px)").matches) {
                setTimeout(() => {
                    if (sidebar && sidebar.classList.contains("open")) lockBody();
                }, 0);
            }
        }, true);
    }
    if (closeBtn) {
        closeBtn.addEventListener("click", () => {
            unlockBody();
        }, true);
    }
    if (overlay) {
        overlay.addEventListener("click", () => {
            unlockBody();
        }, true);
    }

    // Observe class changes on sidebar for open/close from other code paths
    if (sidebar && typeof MutationObserver !== "undefined") {
        const obs = new MutationObserver(() => {
            if (!window.matchMedia("(max-width: 899px)").matches) return;
            if (sidebar.classList.contains("open")) {
                if (!body.style.top) lockBody();
            } else {
                if (body.style.top) {
                    unlockBody();
                    body.classList.remove("sidebar-open");
                }
            }
        });
        obs.observe(sidebar, { attributes: true, attributeFilter: ["class"] });
    }
})();
