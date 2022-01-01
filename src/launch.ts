import * as puppeteer from "puppeteer"
import * as dotenv from "dotenv"

class MyError extends Error {}

(async () => {
    let browser: puppeteer.Browser | null = null

    try {
        let selector: string

        // .env読み込み
        dotenv.config()
        if (process.env.BASE_URL && process.env.WORDPRESS_LOGIN && process.env.WORDPRESS_PASS) {
            ;
        }
        else {
            throw new MyError(".envでの指定が不足しています")
        }
        const baseUrl = process.env.BASE_URL ?? ""
        const wordpressLogin = process.env.WORDPRESS_LOGIN ?? ""
        const wordpressPass = process.env.WORDPRESS_PASS ?? ""
        const isHeadless = process.env.HIDE_BROWSER ? (Number(process.env.HIDE_BROWSER) != 0) : true
        const sleepMsec = process.env.SLEEP_MILLISECOND ? Number(process.env.SLEEP_MILLISECOND) : 2000
        const browserTimeoutMsec = process.env.BROWSER_TIMEOUT_MILLISECOND ? Number(process.env.BROWSER_TIMEOUT_MILLISECOND) : 0
        const pageTimeoutMsec = process.env.PAGE_TIMEOUT_MILLISECOND ? Number(process.env.PAGE_TIMEOUT_MILLISECOND) : 0

        // Puppeteerを起動
        browser = await puppeteer.launch({
            timeout: browserTimeoutMsec,  // タイムアウト設定
            headless: isHeadless, // Headlessモードで起動するかどうか
            slowMo: 20, // 指定のミリ秒スローモーションで実行する
        })

        // 新しい空のページを開く.
        const pageWordpress: puppeteer.Page = await browser.newPage()
        await pageWordpress.setViewport({
            width: 1200,
            height: 800,
        })
        await pageWordpress.setDefaultNavigationTimeout(pageTimeoutMsec)    // タイムアウト設定

        // ログインページへ
        const loginUrl = baseUrl + "/login"
        await pageWordpress.goto(loginUrl, { waitUntil: ["load", "networkidle0"] })
        await pageWordpress.waitForTimeout(sleepMsec)

        // ユーザー名を入力
        selector = "#user_login"
        await pageWordpress.evaluate(selector => { document.querySelector(selector).value = "" }, selector)
        await pageWordpress.type(selector, wordpressLogin)

        // パスワードを入力
        selector = "#user_pass"
        await pageWordpress.evaluate(selector => { document.querySelector(selector).value = "" }, selector)
        await pageWordpress.type(selector, wordpressPass)

        // ログインボタンを押す
        // 参考ページ：
        // https://qiita.com/hnw/items/a07e6b88d95d1656e02f
        selector = "#wp-submit"
        await Promise.all([
            pageWordpress.waitForNavigation({ waitUntil: ["load", "networkidle0"] }),
            pageWordpress.click(selector),
        ])
        await pageWordpress.waitForTimeout(sleepMsec)

        // ログアウト処理は省略した
        console.log("無事終了")
    }
    finally {
        // ブラウザを終了
        if (browser ?? false) {
            await browser.close()
        }
    }
})()
