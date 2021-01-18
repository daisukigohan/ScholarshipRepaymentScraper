const puppeteer = require('puppeteer')

const USER_ID = "XXXXXX" //スカラネット・パーソナルのログインID
const PASSWORD = "XXXXXX" //スカラネット・パーソナルのパスワード
const SYOGAKU_BANGOU_1 = "XXX" // 奨学生番号の最初の3桁
const SYOGAKU_BANGOU_2 = "XX" // 奨学生番号の真ん中の2桁
const SYOGAKU_BANGOU_3 = "XXXXXX" // 奨学生番号の末尾の6桁

const main = async () => {

  // headless: falseでChromeを起動
  const browser = await puppeteer.launch({
    headless: false
  })
  const page = await browser.newPage()

  // スカラネット・パーソナルのログインページへ遷移
  await page.goto('https://scholar-ps.sas.jasso.go.jp/mypage/login_open.do', { waitUntil: 'domcontentloaded' })

  // 最初のログイン画面にIDをパスワードを入力
  await page.type('input[name="userId"]', USER_ID);
  await page.type('input[name="password"]',PASSWORD);

  // クリックしてログイン
  await page.click('input[name="login_submit"]');
  await page.waitForSelector('input[name="syogkseiBg1"]', { timeout: 120000 });

  // 奨学生番号を入力
  await page.type('input[name="syogkseiBg1"]', SYOGAKU_BANGOU_1);
  await page.select('select[name="syogkseiBg2"]', SYOGAKU_BANGOU_2);
  await page.type('input[name="syogkseiBg3"]', SYOGAKU_BANGOU_3);

  // クリックしてログイン
  await page.click('input[name="syogkseiBgKakunin_submit"]');
  await page.waitForSelector('a[id="syosaiJohoTab"]', { timeout: 120000 });

  // 詳細情報画面へ遷移
  await page.click('a[id="syosaiJohoTab"]');
  await page.waitForSelector('.henkan-joho-row', { timeout: 120000 });

  // テーブルの情報を取得して、MapとしてReturn
  const data = await page.evaluate(() => {
    const tds = Array.from(document.querySelectorAll('.henkan-joho-row'))
    return tds.map(td => td.innerText)
  });

  var tableMap = new Map();

  data.forEach(function (value) {
    var tableText = value.split('\t');
    if (tableText.length === 3) {
      tableText.splice(0, 1)
    }
    if (tableText.length != 1) {
      console.log(tableMap.set(tableText[0], tableText[1]));
    }
  })

  // Mapの中身を出力
  for (const [key, value] of tableMap) { 
    console.log({ key, value });
  }
  // 終了
  await browser.close()
}

main()

