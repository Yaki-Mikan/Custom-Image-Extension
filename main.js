// ベースパスを設定（例: 画像が保存されているトップレベルのディレクトリ）
const basePath = "/images/";

// キーワードと画像ベースパスを保存するオブジェクト
let imageMappings = {};

// ローカルストレージからデータを読み込む関数
function loadMappings() {
    const savedMappings = localStorage.getItem("imageMappings");
    if (savedMappings) {
        imageMappings = JSON.parse(savedMappings);
        console.log("Loaded image mappings from local storage:", imageMappings);
    }
}

// ローカルストレージにデータを保存する関数
function saveMappings() {
    localStorage.setItem("imageMappings", JSON.stringify(imageMappings));
    console.log("Saved image mappings to local storage:", imageMappings);
}

// フローティングウィンドウのUIを作成する関数
function createFloatingWindow() {
    const floatingWindow = document.createElement("div");
    floatingWindow.id = "floating-settings";
    floatingWindow.style.position = "fixed";
    floatingWindow.style.top = "20%";
    floatingWindow.style.left = "20%";
    floatingWindow.style.width = "300px";
    floatingWindow.style.backgroundColor = "#f9f9f9";
    floatingWindow.style.border = "1px solid #ccc";
    floatingWindow.style.padding = "15px";
    floatingWindow.style.zIndex = "1001";
    floatingWindow.style.cursor = "move";
    floatingWindow.style.boxShadow = "0px 0px 10px rgba(0, 0, 0, 0.2)";
    floatingWindow.style.display = "none";

    // タイトル
    const title = document.createElement("h3");
    title.textContent = "Image Keyword Settings";
    title.style.margin = "0";
    floatingWindow.appendChild(title);

    // キーワード入力フィールド
    const keywordInput = document.createElement("input");
    keywordInput.placeholder = "Keyword (e.g., image01)";
    keywordInput.style.width = "100%";
    keywordInput.style.marginTop = "10px";
    floatingWindow.appendChild(keywordInput);

    // 登録ボタン
    const addButton = document.createElement("button");
    addButton.textContent = "Add Mapping";
    addButton.style.width = "100%";
    addButton.style.marginTop = "10px";
    addButton.addEventListener("click", () => {
        const keyword = keywordInput.value.trim();
        if (keyword) {
            imageMappings[keyword] = true;  // キーワードのみを登録
            saveMappings(); // ローカルストレージに保存
            console.log(`Added keyword: ${keyword}`);
            keywordInput.value = "";
        } else {
            alert("Please enter a keyword.");
        }
    });
    floatingWindow.appendChild(addButton);

    // 閉じるボタン
    const closeButton = document.createElement("button");
    closeButton.textContent = "Close";
    closeButton.style.width = "100%";
    closeButton.style.marginTop = "10px";
    closeButton.addEventListener("click", () => {
        floatingWindow.style.display = "none";
    });
    floatingWindow.appendChild(closeButton);

    document.body.appendChild(floatingWindow);
}

// フローティングウィンドウを表示するトグルボタンを作成
function createFloatingWindowToggleButton() {
    const button = document.createElement("button");
    button.id = "toggle-floating-button";
    button.textContent = "Image Settings";
    button.style.position = "fixed";
    button.style.top = "10px";
    button.style.left = "10px";
    button.style.zIndex = "1002";
    button.addEventListener("click", () => {
        const floatingWindow = document.getElementById("floating-settings");
        floatingWindow.style.display = floatingWindow.style.display === "none" ? "block" : "none";
    });
    document.body.appendChild(button);
}

// チャットメッセージを監視し、キャラクター名とキーワードに応じた画像を表示
function monitorChatForImageCommand() {
    const chatContainer = document.querySelector('.chat-container');

    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.addedNodes.length) {
                const newMessage = mutation.addedNodes[0].textContent;
                const characterName = mutation.addedNodes[0].getAttribute('data-character'); // 発言者のキャラクター名を取得

                // 発言キャラクター名が存在し、コマンドが正しい場合に処理を続行
                if (characterName && newMessage.startsWith("/image")) {
                    const command = newMessage.split(" ")[1];

                    if (imageMappings[command]) {
                        // basePath + キャラクターディレクトリ + キーワード.png の形式でURLを生成
                        const imageUrl = `${basePath}${characterName}/${command}.png`;
                        
                        // 画像が存在するかどうかを確認する（非同期リクエストで存在チェック）
                        fetch(imageUrl, { method: 'HEAD' })
                            .then(response => {
                                if (response.ok) {
                                    showImage(imageUrl);
                                } else {
                                    console.warn("Image not found:", imageUrl);
                                }
                            })
                            .catch(err => console.warn("Image fetch error:", err));
                    }
                }
            }
        });
    });

    observer.observe(chatContainer, { childList: true, subtree: true });
}

// 画像を表示する関数
function showImage(url) {
    const img = document.createElement("img");
    img.src = url;
    img.style.position = "absolute";
    img.style.top = "50%";
    img.style.left = "50%";
    img.style.transform = "translate(-50%, -50%)";
    img.style.maxWidth = "80%";
    img.style.maxHeight = "80%";
    img.style.zIndex = "1000";

    img.addEventListener("click", () => {
        img.remove();
    });

    document.body.appendChild(img);
}

// 各種初期化
loadMappings(); // 起動時にローカルストレージからマッピングを読み込み
createFloatingWindow();
createFloatingWindowToggleButton();
monitorChatForImageCommand();
