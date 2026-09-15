/* =========================
   TRỢ LÝ HUẾ HERITAGE
========================= */


/* =========================
   TRẠNG THÁI CHAT
========================= */

// Chống gửi một tin nhắn 2 lần
let isSendingMessage = false;


/* =========================
   MỞ / ĐÓNG CHATBOT
========================= */

function toggleAIChat() {

    const chatBox =
        document.getElementById("aiChatBox");

    if (!chatBox) {
        return;
    }

    chatBox.hidden = !chatBox.hidden;

    if (!chatBox.hidden) {

        const input =
            document.getElementById("aiChatInput");

        if (input) {
            input.focus();
        }
    }
}


/* =========================
   HIỂN THỊ MENU
========================= */

function showChatOption(option) {

    const chatMessages =
        document.getElementById("aiChatMessages");

    if (!chatMessages) {
        return;
    }


    /* =========================
       XÁC ĐỊNH MÀN HÌNH
    ========================= */

    let screen = null;


    if (option === "visit") {

        screen =
            document.getElementById("chatVisit");

    }


    if (option === "food") {

        screen =
            document.getElementById("chatFood");

    }


    if (option === "gift") {

        screen =
            document.getElementById("chatGift");

    }


    if (!screen) {
        return;
    }


    /* =========================
       ĐƯA MENU XUỐNG CUỐI CHAT
    ========================= */

    chatMessages.appendChild(screen);


    /* =========================
       HIỆN MENU
    ========================= */

    screen.hidden = false;


    /* =========================
       CUỘN XUỐNG CUỐI
    ========================= */

    chatMessages.scrollTop =
        chatMessages.scrollHeight;
}
/* =========================
   ẨN CÁC MÀN HÌNH MENU
========================= */

function hideAllChatScreens() {

    const screens = [
        "chatWelcome",
        "chatSuggestion",
        "chatVisit",
        "chatFood",
        "chatGift",
        "chatResult"
    ];


    screens.forEach(function (id) {

        const element =
            document.getElementById(id);

        if (element) {
            element.hidden = true;
        }

    });
}


/* =========================
   QUAY LẠI MENU ĐỀ XUẤT
========================= */

function backToChatWelcome() {

    const chatMessages =
        document.getElementById("aiChatMessages");

    if (!chatMessages) {
        return;
    }


    const suggestion =
        document.getElementById("chatSuggestion");

    if (!suggestion) {
        return;
    }


    /*
     * Đưa menu đề xuất xuống cuối
     * cuộc trò chuyện
     */
    chatMessages.appendChild(suggestion);


    /*
     * Hiện lại menu
     */
    suggestion.hidden = false;


    /*
     * Cuộn xuống cuối
     */
    chatMessages.scrollTop =
        chatMessages.scrollHeight;
}


/* =========================
   THAM QUAN
========================= */

function showHeritageRecommendation(id) {

    /* =========================
       ĐẠI NỘI
    ========================= */

    if (id === "dai-noi") {

        closeAIChatAndShowHeritage(
            "daiNoiCard",
            1
        );

        return;
    }


    /* =========================
       CHÙA THIÊN MỤ
    ========================= */

    if (id === "thien-mu") {

        closeAIChatAndShowHeritage(
            "thienMuCard",
            2
        );

        return;
    }


    /* =========================
       LĂNG TỰ ĐỨC
    ========================= */

    if (id === "tu-duc") {

        closeAIChatAndShowHeritage(
            "tuDucCard",
            3
        );

        return;
    }
}


/* =========================
   ĐÓNG CHAT + MỞ DI TÍCH
========================= */

function closeAIChatAndShowHeritage(
    cardId,
    placeId
) {

    const chatBox =
        document.getElementById("aiChatBox");

    if (chatBox) {
        chatBox.hidden = true;
    }


    const card =
        document.getElementById(cardId);

    if (!card) {
        return;
    }


    card.scrollIntoView({
        behavior: "smooth",
        block: "center"
    });


    setTimeout(function () {

        if (typeof showPlace === "function") {
            showPlace(placeId);
        }

    }, 700);
}


/* =========================
   ẨM THỰC
========================= */

function showFoodRecommendation(id) {

    const results = [
        "resultBunBo",
        "resultBanhEp",
        "resultBanhBeo"
    ];


    /* =========================
       ẨN TẤT CẢ KẾT QUẢ
    ========================= */

    results.forEach(function (resultId) {

        const element =
            document.getElementById(resultId);

        if (element) {
            element.hidden = true;
        }

    });


    /* =========================
       BÚN BÒ
    ========================= */

    if (id === "bun-bo") {

        const result =
            document.getElementById("resultBunBo");

        if (result) {
            result.hidden = false;
        }

        return;
    }


    /* =========================
       BÁNH ÉP
    ========================= */

    if (id === "banh-ep") {

        const result =
            document.getElementById("resultBanhEp");

        if (result) {
            result.hidden = false;
        }

        return;
    }


    /* =========================
       BÁNH BÈO
    ========================= */

    if (id === "banh-beo") {

        const result =
            document.getElementById("resultBanhBeo");

        if (result) {
            result.hidden = false;
        }

        return;
    }
}


/* =========================
   MUA QUÀ
========================= */

function goToGiftSection() {

    const chatBox =
        document.getElementById("aiChatBox");

    if (chatBox) {
        chatBox.hidden = true;
    }


    const giftSection =
        document.getElementById("gift");

    if (!giftSection) {
        return;
    }


    giftSection.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}


/* =========================
   XỬ LÝ ENTER
========================= */

function handleAIChatKey(event) {

    if (!event) {
        return;
    }


    if (event.key !== "Enter") {
        return;
    }


    /*
     * Ngăn hành động mặc định
     */
    event.preventDefault();


    /*
     * Ngăn sự kiện chạy tiếp
     */
    event.stopPropagation();


    /*
     * Nếu giữ Enter
     * không gửi nhiều lần
     */
    if (event.repeat) {
        return;
    }


    sendAIMessage();
}


/* =========================
   GỬI TIN NHẮN
========================= */

function sendAIMessage() {

    /*
     * Chống gửi cùng một tin nhắn 2 lần
     */
    if (isSendingMessage) {
        return;
    }


    const input =
        document.getElementById("aiChatInput");

    if (!input) {
        return;
    }


    const message =
        input.value.trim();

    if (!message) {
        return;
    }


    /*
     * Khóa gửi trong thời gian ngắn
     */
    isSendingMessage = true;


    setTimeout(function () {

        isSendingMessage = false;

    }, 400);


    /*
     * Xóa ô nhập
     */
    input.value = "";


    /*
     * Hiển thị tin nhắn khách
     */
    addUserMessage(message);


    /*
     * Chuẩn hóa nội dung
     */
    const text =
        removeVietnameseAccent(message)
            .toLowerCase()
            .trim();


    /* =========================
       KHÁCH TRẢ LỜI CÓ
    ========================= */

    if (isPositiveAnswer(text)) {

        showRecommendation();

        return;
    }


    /* =========================
       KHÁCH TRẢ LỜI KHÔNG
    ========================= */

    if (isNegativeAnswer(text)) {

        showGoodbyeMessage();

        return;
    }


    /* =========================
       KHÁCH NHẬP CÂU KHÁC
    ========================= */

    addBotMessage(
        "😊 Mình có thể hỗ trợ bạn khám phá Huế. Bạn có muốn mình đề xuất một số lựa chọn không?"
    );
}


/* =========================
   KIỂM TRA CÂU TRẢ LỜI CÓ
========================= */

function isPositiveAnswer(text) {

    const positiveWords = [

        "co",
        "co nhe",
        "co a",
        "co nha",

        "duoc",
        "duoc nhe",
        "duoc a",
        "duoc nha",

        "ok",
        "okay",
        "oke",

        "dong y",

        "uh",
        "u",

        "yes",
        "y",

        "tat nhien",

        "duoc do",

        "hay de xuat",

        "de xuat",

        "de xuat cho toi"

    ];


    if (positiveWords.includes(text)) {
        return true;
    }


    /*
     * Cho phép những câu dài hơn
     */
    if (
        text.startsWith("co ") ||
        text.startsWith("duoc ") ||
        text.startsWith("ok ") ||
        text.startsWith("oke ") ||
        text.includes("dong y") ||
        text.includes("tat nhien") ||
        text.includes("hay de xuat") ||
        text.includes("de xuat cho toi")
    ) {

        return true;
    }


    return false;
}


/* =========================
   KIỂM TRA CÂU TRẢ LỜI KHÔNG
========================= */

function isNegativeAnswer(text) {

    const negativeWords = [

        "khong",
        "khong nhe",
        "khong a",
        "khong nha",

        "khong can",
        "khong can dau",

        "thoi",
        "thoi cam on",

        "khong cam on",

        "chua can",
        "chua"

    ];


    if (negativeWords.includes(text)) {
        return true;
    }


    /*
     * Cho phép câu dài hơn
     */
    if (
        text.startsWith("khong ") ||
        text.startsWith("thoi ") ||
        text.includes("khong can") ||
        text.includes("chua can")
    ) {

        return true;
    }


    return false;
}


/* =========================
   BỎ DẤU TIẾNG VIỆT
========================= */

function removeVietnameseAccent(text) {

    return text
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/đ/g, "d")
        .replace(/Đ/g, "D");
}


/* =========================
   HIỆN 3 ĐỀ XUẤT
========================= */

function showRecommendation() {

    const chatMessages =
        document.getElementById("aiChatMessages");

    if (!chatMessages) {
        return;
    }


    const suggestion =
        document.getElementById("chatSuggestion");

    if (!suggestion) {
        return;
    }


    /*
     * Đưa khối đề xuất xuống cuối
     * để nó nằm SAU tin nhắn "Có"
     *
     * Không tạo HTML mới.
     * Chỉ di chuyển phần tử HTML
     * đã có sẵn trong index.html.
     */
    chatMessages.appendChild(suggestion);


    /*
     * Hiện phần đề xuất
     */
    suggestion.hidden = false;


    /*
     * Cuộn xuống cuối
     */
    chatMessages.scrollTop =
        chatMessages.scrollHeight;
}


/* =========================
   KHÁCH KHÔNG MUỐN ĐỀ XUẤT
========================= */

function showGoodbyeMessage() {

    /*
     * Không gọi hideAllChatScreens()
     *
     * Vì nếu gọi sẽ làm mất
     * nội dung cuộc trò chuyện trước đó.
     */

    addBotMessage(
        "😊 Không sao! Cảm ơn bạn đã ghé thăm Huế Heritage 360. Nếu cần hỗ trợ gì, bạn cứ nhắn cho mình nhé. 👋 Hẹn gặp lại!"
    );
}


/* =========================
   HIỆN TIN NHẮN KHÁCH
========================= */

function addUserMessage(message) {

    const chatMessages =
        document.getElementById("aiChatMessages");

    if (!chatMessages) {
        return;
    }


    const messageElement =
        document.createElement("div");

    messageElement.className =
        "ai-message ai-message-user";


    /*
     * Dùng textContent
     * để không tạo HTML từ JS
     */
    messageElement.textContent =
        message;


    chatMessages.appendChild(
        messageElement
    );


    /*
     * Cuộn xuống cuối
     */
    chatMessages.scrollTop =
        chatMessages.scrollHeight;
}


/* =========================
   HIỆN TIN NHẮN BOT
========================= */

function addBotMessage(message) {

    const chatMessages =
        document.getElementById("aiChatMessages");

    if (!chatMessages) {
        return;
    }


    const messageElement =
        document.createElement("div");

    messageElement.className =
        "ai-message ai-message-bot";


    /*
     * Dùng textContent
     * không dùng innerHTML
     */
    messageElement.textContent =
        message;


    chatMessages.appendChild(
        messageElement
    );


    /*
     * Cuộn xuống cuối
     */
    chatMessages.scrollTop =
        chatMessages.scrollHeight;
}