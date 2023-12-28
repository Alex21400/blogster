const Page = require('./helpers/page');

let page;

beforeEach(async () => {
    page = await Page.build();
    await page.goto('http://localhost:3000');
});

afterEach(async () => {
    await page.close();
});

test('Header has the right text', async () => {
    const logoText = await page.getContents('a.brand-logo');

    expect(logoText).toEqual('Blogster');
});

test('Clicking login starts OAuth flow', async () => {
    await page.click('.right a');

    const url = await page.url();
    expect(url).toMatch(/accounts\.google\.com/);
});

test('when signed in, shows logout button', async () => {
    await page.login();
    
    // const logoutText = await page.$eval('a[href="/auth/logout"]', el => el.innerHTML);
    const logoutText = await page.getContents('a[href="/auth/logout"]');
    expect(logoutText).toEqual('Logout');
});