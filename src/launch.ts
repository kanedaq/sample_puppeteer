import * as puppeteer from "puppeteer";
import * as dotenv from "dotenv"

(async () => {
    let browserWordpress: puppeteer.Browser | null = null;

    try {
        let selector: string;

        // .env読み込み
        dotenv.config();
        const baseUrl = `${process.env.BASE_URL}`
        const isHeadless = (Number(`${process.env.HIDE_BROWSER}`) != 0);
        const sleepMsec = Number(`${process.env.SLEEP_MILLISECOND}`);
        const browserTimeoutMsec = Number(`${process.env.BROWSER_TIMEOUT_MILLISECOND}`);
        const pageTimeoutMsec = Number(`${process.env.PAGE_TIMEOUT_MILLISECOND}`);

        // Puppeteerを起動
        browserWordpress = await puppeteer.launch({
            timeout: browserTimeoutMsec,  // タイムアウト設定
            headless: isHeadless, // Headlessモードで起動するかどうか
            slowMo: 20, // 指定のミリ秒スローモーションで実行する
        });

        // 新しい空のページを開く.
        const pageWordpress: puppeteer.Page = await browserWordpress.newPage();
        await pageWordpress.setViewport({
            width: 1200,
            height: 800,
        });
        await pageWordpress.setDefaultNavigationTimeout(pageTimeoutMsec); // タイムアウト設定

        // ログインページへ
        const loginUrl = baseUrl + "/login";
        await pageWordpress.goto(loginUrl, { waitUntil: ["load", "networkidle0"] });
        await pageWordpress.waitForTimeout(sleepMsec);

        // ユーザー名を入力
        const wordpressLogin = `${process.env.WORDPRESS_LOGIN}`;
        selector = "#user_login";
        await pageWordpress.evaluate(selector => { document.querySelector(selector).value = ""; }, selector);
        await pageWordpress.type(selector, wordpressLogin);

        // パスワードを入力
        const wordpressPass = `${process.env.WORDPRESS_PASS}`;
        selector = "#user_pass";
        await pageWordpress.evaluate(selector => { document.querySelector(selector).value = ""; }, selector);
        await pageWordpress.type(selector, wordpressPass);

        // ログインボタンを押す
        // 参考ページ：
        // https://qiita.com/hnw/items/a07e6b88d95d1656e02f
        selector = "#wp-submit";
        await Promise.all([
            pageWordpress.waitForNavigation({ waitUntil: ["load", "networkidle0"] }),
            pageWordpress.click(selector),
        ]);
        await pageWordpress.waitForTimeout(sleepMsec);

        // ログアウト処理は省略した
        console.log("無事終了");
    }
    finally {
        // ブラウザを終了
        if (browserWordpress ?? false) {
            await browserWordpress.close();
        }
    }
})();
