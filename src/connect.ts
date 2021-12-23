import * as puppeteer from "puppeteer";
import * as dotenv from "dotenv"

(async () => {
        // .env読み込み
        dotenv.config();
        const baseUrl = `${process.env.BASE_URL}`
        const browserUrl = `${process.env.BROWSER_URL}`
        const sleepMsec = Number(`${process.env.SLEEP_MILLISECOND}`);
        const pageTimeoutMsec = Number(`${process.env.PAGE_TIMEOUT_MILLISECOND}`);

        // 手動でログイン済のブラウザにPuppeteerから接続する。
        // ブラウザ起動コマンド：
        //     cd node_modules\puppeteer\.local-chromium\win64-938248\chrome-win
        //     .\chrome --remote-debugging-port=9222
        // ログインページ（あらかじめ手動でログインする）：
        //     http://192.168.1.101:8000/login
        const browserWordpress = await puppeteer.connect({
            browserURL: browserUrl,
            slowMo: 20, // 指定のミリ秒スローモーションで実行する
        });

        // 新しい空のページを開く.
        const pageWordpress: puppeteer.Page = await browserWordpress.newPage();
        await pageWordpress.setViewport({
            width: 1200,
            height: 800,
        });
        await pageWordpress.setDefaultNavigationTimeout(pageTimeoutMsec); // タイムアウト設定

        // 管理ページへ
        const adminUrl = baseUrl + "/wp-admin";
        await pageWordpress.goto(adminUrl, { waitUntil: ["load", "networkidle0"] });
        await pageWordpress.waitForTimeout(sleepMsec);

        // ログアウトはログイン同様、手動で行うことにする
        console.log("無事終了");
})();
