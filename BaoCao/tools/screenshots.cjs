// Chụp màn hình giao diện hệ thống bằng Chrome headless (puppeteer-core).
// Chạy: node screenshots.cjs [tên-màn-hình ...]   (không truyền tên = chụp tất cả)
const fs = require('fs');
const path = require('path');
const puppeteer = require(process.env.PUPPETEER_CORE || 'puppeteer-core');

const CLIENT = 'http://localhost:5173';
const API = 'http://localhost:3000/api';
const OUT = path.join(__dirname, '..', 'images', 'ui');
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';

const accounts = JSON.parse(fs.readFileSync(path.join(__dirname, 'test_accounts.json'), 'utf8'));
const initAdmin = fs.readFileSync(path.join(__dirname, '..', '..', 'QuanLyThuVien', 'server', 'src', 'seeds', 'initAdmin.js'), 'utf8');
accounts.admin = {
    email: initAdmin.match(/const email = '([^']+)'/)[1],
    password: initAdmin.match(/bcrypt\.hash(?:Sync)?\(\s*'([^']+)'/)[1],
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function login(page, who) {
    await page.goto(CLIENT + '/', { waitUntil: 'networkidle0' });
    const acc = accounts[who];
    const res = await page.evaluate(async (api, email, password) => {
        const r = await fetch(api + '/users/login', {
            method: 'POST', credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });
        return r.status;
    }, API, acc.email, acc.password);
    if (res !== 200) throw new Error('login failed ' + who + ' ' + res);
}

async function logout(page) {
    await page.evaluate(async (api) => {
        await fetch(api + '/users/logout', { method: 'POST', credentials: 'include' }).catch(() => {});
    }, API);
    const client = await page.target().createCDPSession();
    await client.send('Network.clearBrowserCookies');
}

async function shot(page, name, { url, fullPage = false, maxHeight = 2200, before } = {}) {
    if (url) await page.goto(CLIENT + url, { waitUntil: 'networkidle0' });
    await sleep(900);
    if (before) { await before(page); await sleep(900); }
    const file = path.join(OUT, name + '.png');
    if (fullPage) {
        const h = await page.evaluate(() => document.documentElement.scrollHeight);
        await page.screenshot({ path: file, clip: { x: 0, y: 0, width: 1440, height: Math.min(h, maxHeight) }, captureBeyondViewport: true });
    } else {
        await page.screenshot({ path: file });
    }
    console.log('✓', name);
}

async function clickText(page, selector, text) {
    const ok = await page.evaluate((sel, t) => {
        const el = [...document.querySelectorAll(sel)].find((e) => e.innerText && e.innerText.trim().includes(t));
        if (el) { el.click(); return true; }
        return false;
    }, selector, text);
    if (!ok) console.warn('  ! không tìm thấy', selector, text);
}

(async () => {
    fs.mkdirSync(OUT, { recursive: true });
    const only = process.argv.slice(2);
    const want = (n) => only.length === 0 || only.includes(n);

    const books = (await (await fetch(API + '/books?limit=100')).json()).metadata.books.sort((a, b) => a.id - b.id);
    const reviewed = books.find((b) => b.availableQuantity > 1) || books[0];
    const booksWithReview = await Promise.all(books.map(async (b) => {
        const r = await (await fetch(`${API}/reviews/book/${b.id}`)).json();
        return { b, n: r.metadata?.summary?.totalRatings ?? r.metadata?.total ?? 0 };
    }));
    const detailBook = (booksWithReview.sort((x, y) => y.n - x.n)[0] || { b: reviewed }).b;
    const reservedBook = books[books.length - 1];

    const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new', args: ['--no-sandbox', '--lang=vi-VN'] });
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1.25 });

    // ── Khách (chưa đăng nhập) ──
    if (want('ui_home')) await shot(page, 'ui_home', { url: '/', fullPage: true, maxHeight: 2600 });
    if (want('ui_login')) await shot(page, 'ui_login', { url: '/login' });
    if (want('ui_register')) await shot(page, 'ui_register', { url: '/register' });
    if (want('ui_search')) await shot(page, 'ui_search', { url: '/search', fullPage: true, maxHeight: 1500 });
    if (want('ui_articles')) await shot(page, 'ui_articles', { url: '/articles' });
    if (want('ui_contact')) await shot(page, 'ui_contact', { url: '/contact' });

    // ── Độc giả 1 ──
    await login(page, 'reader1');
    if (want('ui_book_detail')) await shot(page, 'ui_book_detail', { url: `/books/${detailBook.id}`, fullPage: true, maxHeight: 2400 });
    if (want('ui_my_borrows')) await shot(page, 'ui_my_borrows', { url: '/my/borrows' });
    if (want('ui_my_fines')) await shot(page, 'ui_my_fines', { url: '/my/fines' });
    if (want('ui_profile')) await shot(page, 'ui_profile', { url: '/profile' });
    if (want('ui_profile_borrows')) await shot(page, 'ui_profile_borrows', { url: '/profile', before: (p) => clickText(p, 'button, a, li, div[role=button]', 'Lịch sử mượn') });
    if (want('ui_profile_fines')) await shot(page, 'ui_profile_fines', { url: '/profile?tab=fines' });
    if (want('ui_library_card')) await shot(page, 'ui_library_card', { url: '/profile', before: (p) => clickText(p, 'button, a, li, div[role=button]', 'Thẻ thư viện') });
    if (want('ui_notifications')) await shot(page, 'ui_notifications', {
        url: '/', before: async (p) => {
            await p.evaluate(() => {
                const svg = document.querySelector('svg.lucide-bell');
                const btn = svg && svg.closest('button');
                if (btn) btn.click();
            });
        },
    });
    if (want('ui_ai_chat')) await shot(page, 'ui_ai_chat', { url: '/ai-chat' });
    if (want('ui_ai_chat_answer')) await shot(page, 'ui_ai_chat_answer', {
        url: '/ai-chat', before: async (p) => {
            await p.type('textarea', 'Gợi ý cho mình vài cuốn văn học Việt Nam phù hợp để đọc cuối tuần');
            await p.keyboard.press('Enter');
            await p.waitForFunction(() => !document.body.innerText.includes('Đang suy nghĩ') && document.querySelectorAll('img').length > 2, { timeout: 60000 }).catch(() => {});
            await sleep(4000);
        },
    });
    if (want('ui_borrow_modal')) await shot(page, 'ui_borrow_modal', {
        url: `/books/${books[10].id}`, before: async (p) => { await clickText(p, 'button', 'Gửi yêu cầu mượn'); },
    });
    await logout(page);

    // ── Độc giả 3: đặt trước ──
    await login(page, 'reader3');
    if (want('ui_reservation_book')) await shot(page, 'ui_reservation_book', { url: `/books/${reservedBook.id}` });
    if (want('ui_my_reservations')) await shot(page, 'ui_my_reservations', { url: '/my/reservations' });
    await logout(page);

    // ── Quản trị viên ──
    await login(page, 'admin');
    const adminPages = [
        ['ui_admin_dashboard', '/admin', true],
        ['ui_admin_books', '/admin/books', false],
        ['ui_admin_book_form', '/admin/books/new', true],
        ['ui_admin_categories', '/admin/categories', false],
        ['ui_admin_genres', '/admin/genres', false],
        ['ui_admin_authors', '/admin/authors', false],
        ['ui_admin_publishers', '/admin/publishers', false],
        ['ui_admin_borrows', '/admin/borrows', false],
        ['ui_admin_fines', '/admin/fines', false],
        ['ui_admin_readers', '/admin/readers', false],
        ['ui_admin_reviews', '/admin/reviews', false],
        ['ui_admin_articles', '/admin/articles', false],
        ['ui_admin_contacts', '/admin/contacts', false],
        ['ui_admin_reports', '/admin/reports', false],
        ['ui_admin_configs', '/admin/configs', false],
    ];
    // Trang cấu hình: che giá trị cấu hình thật (email, OAuth, khóa API) trước khi chụp — chỉ sửa DOM, không lưu
    const maskInputs = async (p) => {
        await p.evaluate(() => {
            document.querySelectorAll('input').forEach((i) => {
                if (i.value) { i.type = 'text'; i.value = '•••••••••••• (đã ẩn)'; }
            });
        });
    };
    for (const [n, u, full] of adminPages) {
        if (want(n)) await shot(page, n, { url: u, fullPage: full, maxHeight: 2000, before: n === 'ui_admin_configs' ? maskInputs : undefined });
    }
    await logout(page);

    // ── Thủ thư ──
    await login(page, 'librarian');
    if (want('ui_staff_dashboard')) await shot(page, 'ui_staff_dashboard', { url: '/staff' });
    if (want('ui_staff_borrows')) await shot(page, 'ui_staff_borrows', { url: '/staff/borrows' });
    await logout(page);

    await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
