const Page = require('./helpers/page');

let page;

beforeEach(async () => {
    page = await Page.build();
    await page.goto('http://localhost:3000');
});

afterEach(async () => {
    await page.close();
});

describe('when logged in', async () => {
    beforeEach(async () => {
        await page.login();
        // click on add blog button
        await page.click('a.btn-floating');
    });

    test('can see blog create form', async () => {
        const label = await page.getContents('form label');
        expect(label).toEqual('Blog Title');
    });

    describe('and using valid form inputs', async () => {
        beforeEach(async () => {
            await page.type('.title input', 'Some random title');
            await page.type('.content input', 'Some random content');
            await page.click('form button');
        });

        test('submitting takes user to the review screen', async () => {
            const text = await page.getContents('h5');
            expect(text).toEqual('Please confirm your entries');
        });

        test('submitting than saving adds the blog to index page', async () => {
            await page.click('button.green');
            // wait for blog card to be loaded on index page when blog is created
            await page.waitFor('.card');

            const title = await page.getContents('.card-title');
            const content = await page.getContents('p');

            expect(title).toEqual('Some random title');
            expect(content).toEqual('Some random content');
        });
    });

    describe('and using invalid form inputs', async () => {
        beforeEach(async () => {
            await page.click('form button');
        });

        test('the form shows an error message', async () => {
            const titleError = await page.getContents('.title .red-text');
            const contentError = await page.getContents('.content .red-text');

            expect(titleError).toEqual('You must provide a value');
            expect(contentError).toEqual('You must provide a value');
        });
    })
});

describe('when not logged in', async () => {
    const actions = [
        {
            method: 'get',
            path: '/api/blogs'
        },
        {
            method: 'post',
            path: '/api/blogs',
            body: {
                title: 'Brand new title',
                content: 'Brand new content'
            }
        }
    ]

    test('user cannot create a blog or see the list of blogs', async () => {
        const results = await page.executeRequests(actions);

        for(let result of results) {
            expect(result).toEqual({ error: 'You must log in!' });
        }
    });
});