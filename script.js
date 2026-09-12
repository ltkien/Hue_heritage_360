
let cameraStream = null;
let scanTimer = null;
let currentCamera = "user";
// Lưu GPS của user
let userLatitude = null;
let userLongitude = null;

let heritageData = [];
let heritageDataLoaded = false;
let cart = [];

let currentProduct = null;
let productQuantity = 1;

// =========================
// DỮ LIỆU SẢN PHẨM
// =========================

let productData = {};
let productDataLoaded = false;

let currentDetailImages = [];
let currentDetailImageIndex = 0;

// =========================
// DỮ LIỆU SERVICES
// =========================
let servicesData = {};
// =========================
// ĐẶT PHÒNG
// =========================
let currentBookingHotel = null;

let bookingData = {
    checkIn: "",
    checkOut: ""
};
// =========================
// ĐẶT TOUR
// =========================

let currentBookingTour = null;

let tourBookingData = {
    tourDate: ""
};



/* =========================================================
   DOM ELEMENTS
========================================================= */

const cameraModal = document.getElementById("cameraModal");

const camera = document.getElementById("camera");
const photo = document.getElementById("photo");
const photoContainer = document.getElementById("photoContainer");

const takePhotoButton =
    document.getElementById("takePhotoButton");

const switchCameraButton =
    document.getElementById("switchCameraButton");

const retakeButton =
    document.getElementById("retakeButton");

const locationStatus =
    document.getElementById("locationStatus");

const locationLoading =
    document.getElementById("locationLoading");

const locationSuccess =
    document.getElementById("locationSuccess");

const locationError =
    document.getElementById("locationError");

const locationErrorMessage =
    document.getElementById("locationErrorMessage");

const heritageFound =
    document.getElementById("heritageFound");

const heritageNotFound =
    document.getElementById("heritageNotFound");

const nearestHeritageName =
    document.getElementById("nearestHeritageName");

const nearestHeritageDistance =
    document.getElementById("nearestHeritageDistance");

const nearestUnsupportedName =
    document.getElementById("nearestUnsupportedName");

const nearestUnsupportedDistance =
    document.getElementById("nearestUnsupportedDistance");

const heritageInfoButton =
    document.getElementById("heritageInfoButton");
const heritageDetected =
    document.getElementById("heritageDetected");

const detectedHeritageName =
    document.getElementById("detectedHeritageName");

const showHeritageInfoButton =
    document.getElementById("showHeritageInfoButton");

const heritageInfo =
    document.getElementById("heritageInfo");

const heritageInfoName =
    document.getElementById("heritageInfoName");

const heritageInfoLocation =
    document.getElementById("heritageInfoLocation");

const heritageInfoDescription =
    document.getElementById("heritageInfoDescription");

const heritageInfoList =
    document.getElementById("heritageInfoList");

const heritageInfoImages =
    document.getElementById("heritageInfoImages");

/* =========================================================
   MỞ CAMERA
========================================================= */

async function openCamera() {

    resetCameraSession();

    const modal =
        bootstrap.Modal.getOrCreateInstance(cameraModal);

    modal.show();

    takePhotoButton.disabled = true;

    await startCamera();

    getUserLocation();
}


/* =========================================================
   START CAMERA
========================================================= */

async function startCamera() {

    try {

        stopCamera();

        if (!navigator.mediaDevices?.getUserMedia) {

            alert(
                "Trình duyệt không hỗ trợ camera."
            );

            return;
        }

        cameraStream =
            await navigator.mediaDevices.getUserMedia({

                video: {
                    facingMode: {
                        ideal: currentCamera
                    }
                },

                audio: false

            });

        camera.srcObject = cameraStream;

        camera.hidden = false;

    }

    catch (error) {

        console.error(
            "Không thể mở camera:",
            error
        );

        alert(
            "Không thể truy cập camera. Hãy kiểm tra quyền camera."
        );
    }
}


/* =========================================================
   SWITCH CAMERA
========================================================= */

async function switchCamera() {

    currentCamera =
        currentCamera === "user"
            ? "environment"
            : "user";

    await startCamera();
}


/* =========================================================
   TAKE PHOTO
========================================================= */

function takePhoto() {

    if (!cameraStream) {
        return;
    }

    if (
        !camera.videoWidth ||
        !camera.videoHeight
    ) {

        console.warn(
            "Camera chưa sẵn sàng."
        );

        return;
    }


    /* Kích thước ảnh */

    photo.width =
        camera.videoWidth;

    photo.height =
        camera.videoHeight;


    /* Vẽ ảnh */

    const context =
        photo.getContext("2d");

    context.drawImage(
        camera,
        0,
        0,
        photo.width,
        photo.height
    );


    /* Chuyển giao diện */

    camera.hidden = true;

    photoContainer.hidden = false;

    takePhotoButton.hidden = true;

    switchCameraButton.hidden = true;

    retakeButton.hidden = false;


    /* Tắt camera */

    stopCamera();


    /* Tìm di tích */

    if (
        userLatitude !== null &&
        userLongitude !== null
    ) {

        findNearestHeritage(
            userLatitude,
            userLongitude
        );

    }

}


/* =========================================================
   RETAKE PHOTO
========================================================= */

async function retakePhoto() {

    clearPhoto();

    stopScan();

    resetLocationResult();

    camera.hidden = false;

    photoContainer.hidden = true;

    takePhotoButton.hidden = false;

    switchCameraButton.hidden = false;

    retakeButton.hidden = true;


    /* Nếu GPS còn tồn tại */

    if (
        userLatitude !== null &&
        userLongitude !== null
    ) {

        showLocationState("success");

        takePhotoButton.disabled = false;

    }

    else {

        getUserLocation();

    }


    await startCamera();
}


/* =========================================================
   STOP CAMERA
========================================================= */

function stopCamera() {

    if (cameraStream) {

        cameraStream
            .getTracks()
            .forEach(track => {
                track.stop();
            });

        cameraStream = null;
    }

    if (camera) {
        camera.srcObject = null;
    }
}


/* =========================================================
   GET GPS
========================================================= */

function getUserLocation() {

    showLocationState("loading");

    takePhotoButton.disabled = true;


    if (!navigator.geolocation) {

        showLocationError(
            "Thiết bị không hỗ trợ định vị."
        );

        return;
    }


    navigator.geolocation.getCurrentPosition(

        position => {

            userLatitude =
                position.coords.latitude;

            userLongitude =
                position.coords.longitude;


            console.log(
                "Latitude:",
                userLatitude
            );

            console.log(
                "Longitude:",
                userLongitude
            );


            showLocationState("success");

            takePhotoButton.disabled = false;

        },


        error => {

            console.error(
                "GPS error:",
                error
            );


            switch (error.code) {

                case 1:

                    showLocationError(
                        "Bạn cần cho phép ứng dụng sử dụng vị trí."
                    );

                    break;


                case 2:

                    showLocationError(
                        "Không thể xác định vị trí. Hãy bật định vị trên thiết bị."
                    );

                    break;


                case 3:

                    showLocationError(
                        "Lấy vị trí quá lâu. Hãy kiểm tra GPS và thử lại."
                    );

                    break;


                default:

                    showLocationError(
                        "Không thể lấy vị trí."
                    );
            }

        },


        {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
        }

    );
}


/* =========================================================
   HIỂN THỊ TRẠNG THÁI GPS
========================================================= */

function showLocationState(state) {

    locationStatus.hidden = false;

    locationLoading.hidden = true;
    locationSuccess.hidden = true;
    locationError.hidden = true;
    heritageFound.hidden = true;
    heritageNotFound.hidden = true;


    switch (state) {

        case "loading":

            locationLoading.hidden = false;

            break;


        case "success":

            locationSuccess.hidden = false;

            break;


        case "found":

            heritageFound.hidden = false;

            break;


        case "not-found":

            heritageNotFound.hidden = false;

            break;

    }
}


/* =========================================================
   GPS ERROR
========================================================= */

function showLocationError(message) {

    locationStatus.hidden = false;

    locationLoading.hidden = true;
    locationSuccess.hidden = true;
    heritageFound.hidden = true;
    heritageNotFound.hidden = true;

    locationError.hidden = false;

    locationErrorMessage.textContent =
        `⚠️ ${message}`;

    takePhotoButton.disabled = true;
}


/* =========================================================
   RESET LOCATION RESULT
========================================================= */

function resetLocationResult() {

    // =========================
    // RESET GPS
    // =========================

    locationStatus.hidden = true;

    locationLoading.hidden = true;
    locationSuccess.hidden = true;
    locationError.hidden = true;
    heritageFound.hidden = true;
    heritageNotFound.hidden = true;


    // =========================
    // RESET NHẬN DIỆN
    // =========================

    heritageDetected.hidden = true;
    heritageInfo.hidden = true;


    // =========================
    // XÓA DATA CŨ
    // =========================

    nearestHeritageName.textContent = "";
    nearestHeritageDistance.textContent = "";

    nearestUnsupportedName.textContent = "";
    nearestUnsupportedDistance.textContent = "";

    detectedHeritageName.textContent = "";

    heritageInfoName.textContent = "";
    heritageInfoLocation.textContent = "";
    heritageInfoDescription.textContent = "";

    heritageInfoList.innerHTML = "";
    heritageInfoImages.innerHTML = "";


    // =========================
    // XÓA EVENT CŨ
    // =========================

    heritageInfoButton.onclick = null;

    showHeritageInfoButton.onclick = null;
}


/* =========================================================
   CLEAR PHOTO
========================================================= */

function clearPhoto() {

    if (!photo) {
        return;
    }

    const context =
        photo.getContext("2d");

    context.clearRect(
        0,
        0,
        photo.width,
        photo.height
    );

    photo.width = 0;
    photo.height = 0;
}


/* =========================================================
   SCAN EFFECT
========================================================= */

function startScan() {

    photoContainer.classList.add(
        "scanning"
    );
}


function stopScan() {

    if (scanTimer) {

        clearTimeout(scanTimer);

        scanTimer = null;
    }

    photoContainer.classList.remove(
        "scanning"
    );
}


/* =========================================================
   CALCULATE DISTANCE
========================================================= */

function calculateDistance(
    lat1,
    lon1,
    lat2,
    lon2
) {

    const R = 6371000;

    const toRadians =
        degrees =>
            degrees * Math.PI / 180;


    lat1 = Number(lat1);
    lon1 = Number(lon1);

    lat2 = Number(lat2);
    lon2 = Number(lon2);


    if (
        !Number.isFinite(lat1) ||
        !Number.isFinite(lon1) ||
        !Number.isFinite(lat2) ||
        !Number.isFinite(lon2)
    ) {

        return NaN;
    }


    const dLat =
        toRadians(lat2 - lat1);

    const dLon =
        toRadians(lon2 - lon1);


    const a =
        Math.sin(dLat / 2) ** 2 +

        Math.cos(
            toRadians(lat1)
        ) *

        Math.cos(
            toRadians(lat2)
        ) *

        Math.sin(dLon / 2) ** 2;


    const c =
        2 *
        Math.atan2(
            Math.sqrt(a),
            Math.sqrt(1 - a)
        );


    return R * c;
}


/* =========================================================
   LOAD HERITAGE DATA
========================================================= */

async function loadHeritageData() {

    try {

        const response =
            await fetch(
                "./data/heritage.json"
            );


        if (!response.ok) {

            throw new Error(
                `HTTP ${response.status}`
            );
        }


        heritageData =
            await response.json();


        heritageDataLoaded = true;


        console.log(
            "Đã tải dữ liệu di tích:",
            heritageData
        );

    }

    catch (error) {

        heritageDataLoaded = false;

        console.error(
            "Không thể tải dữ liệu di tích:",
            error
        );
    }
}


/* =========================================================
   FIND NEAREST HERITAGE
========================================================= */

function findNearestHeritage(
    latitude,
    longitude
) {

    latitude = Number(latitude);
    longitude = Number(longitude);


    if (
        !Number.isFinite(latitude) ||
        !Number.isFinite(longitude)
    ) {

        showLocationError(
            "Tọa độ GPS không hợp lệ."
        );

        return null;
    }


    if (
        !heritageDataLoaded ||
        !heritageData.length
    ) {

        showLocationError(
            "Dữ liệu di tích chưa sẵn sàng."
        );

        return null;
    }


    const places =
        heritageData

            .map(place => {

                const distance =
                    calculateDistance(
                        latitude,
                        longitude,
                        place.latitude,
                        place.longitude
                    );


                return {
                    ...place,
                    distance
                };

            })

            .filter(
                place =>
                    Number.isFinite(
                        place.distance
                    )
            )

            .sort(
                (a, b) =>
                    a.distance -
                    b.distance
            );


    const nearestPlace =
        places[0];


    if (!nearestPlace) {

        showLocationError(
            "Không tìm thấy dữ liệu di tích."
        );

        return null;
    }


    console.log(
        "Di tích gần nhất:",
        nearestPlace.name
    );

    console.log(
        "Khoảng cách:",
        Math.round(
            nearestPlace.distance
        ),
        "m"
    );


    /*
        Giới hạn hiện tại của bạn là 2.000.000 m.
        Nếu mục tiêu là xác định người dùng có thật sự
        đang ở gần di tích Huế hay không, nên giảm con số này.
    */

    const MAX_DISTANCE = 2000000;


    if (
        nearestPlace.distance >
        MAX_DISTANCE
    ) {

        nearestUnsupportedName.textContent =
            nearestPlace.name;

        nearestUnsupportedDistance.textContent =
            `${Math.round(
                nearestPlace.distance
            )} m`;


        showLocationState(
            "not-found"
        );

        return null;
    }


    /* Hiển thị kết quả */

    nearestHeritageName.textContent =
        nearestPlace.name;

    nearestHeritageDistance.textContent =
        `${Math.round(
            nearestPlace.distance
        )} m`;


    heritageInfoButton.onclick =
        () => {

            getPlaceInfoById(
                nearestPlace.id
            );

        };


    showLocationState(
        "found"
    );


    return nearestPlace;
}


/* =========================================================
   GET PLACE INFO
========================================================= */

function getPlaceInfoById(id) {

    const place =
        heritageData.find(
            item =>
                String(item.id) ===
                String(id)
        );

    if (!place) {

        console.error(
            "Không tìm thấy di tích:",
            id
        );

        return;
    }


    // =========================
    // BẮT ĐẦU QUÉT
    // =========================

    startScan();


    // Ẩn kết quả GPS
    heritageFound.hidden = true;
    heritageNotFound.hidden = true;


    // Ẩn các trạng thái cũ
    heritageDetected.hidden = true;
    heritageInfo.hidden = true;


    // =========================
    // XÓA TIMER CŨ
    // =========================

    if (scanTimer) {

        clearTimeout(scanTimer);

        scanTimer = null;
    }


    // =========================
    // QUÉT 5 GIÂY
    // =========================

    scanTimer = setTimeout(() => {

        scanTimer = null;

        stopScan();


        // =========================
        // ĐÃ NHẬN DIỆN
        // =========================

        heritageDetected.hidden = false;


        detectedHeritageName.textContent =
            place.name;


        // =========================
        // NÚT HIỆN THÔNG TIN
        // =========================

        showHeritageInfoButton.onclick =
            () => {

                showHeritageInfo(
                    place.id
                );

            };

    }, 5000);
}
/* =========================================================
   SHOW HERITAGE INFO
========================================================= */

function showHeritageInfo(id) {

    const place =
        heritageData.find(
            item =>
                String(item.id) ===
                String(id)
        );

    if (!place) {

        console.error(
            "Không tìm thấy di tích:",
            id
        );

        return;
    }


    // =========================
    // ẨN "ĐÃ NHẬN DIỆN"
    // =========================

    heritageDetected.hidden = true;


    // =========================
    // HIỆN THÔNG TIN
    // =========================

    heritageInfo.hidden = false;


    // =========================
    // TÊN
    // =========================

    heritageInfoName.textContent =
        place.name;


    // =========================
    // ĐỊA CHỈ
    // =========================

    heritageInfoLocation.textContent =
        place.address ||
        "Chưa có địa chỉ";


    // =========================
    // MÔ TẢ
    // =========================

    heritageInfoDescription.textContent =
        place.description ||
        "Chưa có mô tả";


    // =========================
    // THÔNG TIN
    // =========================

    heritageInfoList.innerHTML = "";


    if (place.type) {

        const li =
            document.createElement("li");

        li.textContent =
            `Loại hình: ${place.type}`;

        heritageInfoList.appendChild(li);
    }


    // =========================
    // HÌNH ẢNH
    // =========================

    heritageInfoImages.innerHTML = "";


    if (
        Array.isArray(place.images) &&
        place.images.length
    ) {

        place.images.forEach(image => {

            const col =
                document.createElement("div");

            col.className =
                "col-md-4";


            const img =
                document.createElement("img");

            img.src = image;

            img.alt = place.name;

            img.className =
                "img-fluid rounded";


            col.appendChild(img);

            heritageInfoImages.appendChild(col);

        });

    }
}

/* =========================================================
   SHOW PLACE MODAL
========================================================= */

function showPlace(id) {

    const place =
        heritageData.find(
            item =>
                String(item.id) ===
                String(id)
        );


    if (!place) {

        console.error(
            "Không tìm thấy di tích:",
            id
        );

        return;
    }


    document.getElementById(
        "placeModalTitle"
    ).textContent =
        place.name;


    document.getElementById(
        "placeName"
    ).textContent =
        place.name;


    document.getElementById(
        "placeLocation"
    ).textContent =
        place.address ||
        "Chưa có địa chỉ";


    document.getElementById(
        "placeDescription"
    ).textContent =
        place.description ||
        "Chưa có mô tả";


    const info =
        document.getElementById(
            "placeInfo"
        );

    info.innerHTML = "";


    if (place.type) {

        const li =
            document.createElement("li");

        li.textContent =
            `Loại hình: ${place.type}`;

        info.appendChild(li);
    }


    const carousel =
        document.getElementById(
            "carouselImages"
        );

    carousel.innerHTML = "";


    if (
        Array.isArray(place.images) &&
        place.images.length
    ) {

        place.images.forEach(
            (image, index) => {

                const item =
                    document.createElement(
                        "div"
                    );


                item.className =
                    `carousel-item ${index === 0
                        ? "active"
                        : ""
                    }`;


                const img =
                    document.createElement(
                        "img"
                    );


                img.src = image;

                img.alt = place.name;

                img.className =
                    "d-block w-100";


                item.appendChild(img);

                carousel.appendChild(item);
            }
        );

    }

    else {

        const item =
            document.createElement(
                "div"
            );


        item.className =
            "carousel-item active";


        item.innerHTML =
            `
                <div class="text-center p-5">
                    Chưa có hình ảnh
                </div>
            `;


        carousel.appendChild(item);
    }


    const modal =
        bootstrap.Modal.getOrCreateInstance(
            document.getElementById(
                "placeModal"
            )
        );


    modal.show();
}


/* =========================================================
   RESET CAMERA SESSION
========================================================= */

function resetCameraSession() {

    stopScan();

    stopCamera();

    clearPhoto();


    camera.hidden = false;

    photoContainer.hidden = true;


    takePhotoButton.hidden = false;

    takePhotoButton.disabled = true;


    switchCameraButton.hidden = false;

    retakeButton.hidden = true;


    resetLocationResult();


    userLatitude = null;
    userLongitude = null;
}


/* =========================================================
   CAMERA MODAL CLOSED
========================================================= */

if (cameraModal) {

    cameraModal.addEventListener(
        "hidden.bs.modal",
        resetCameraSession
    );
}


/* =========================================================
   LOAD DATA
========================================================= */

loadHeritageData();








// =========================
// Đổi tab service
// =========================

function showService(
    serviceType,
    button
) {

    // Ẩn tất cả card
    const cards =
        document.querySelectorAll(
            ".service-card"
        );

    cards.forEach(card => {

        card.style.display = "none";

    });


    // Hiện card đúng loại
    const selectedCards =
        document.querySelectorAll(
            `.service-card.${serviceType}`
        );

    selectedCards.forEach(card => {

        card.style.display = "block";

    });


    // Reset button
    const buttons =
        document.querySelectorAll(
            ".service-btn"
        );

    buttons.forEach(btn => {

        btn.classList.remove(
            "btn-success"
        );

        btn.classList.add(
            "btn-outline-success"
        );

    });


    // Làm sáng button được chọn
    button.classList.remove(
        "btn-outline-success"
    );

    button.classList.add(
        "btn-success"
    );

}


// =========================
// THÊM VÀO GIỎ
// =========================

function addToCart(productName, typeName, price) {
    // Tìm sản phẩm cùng loại trong giỏ
    const existingProduct = cart.find(
        item => item.name === productName && item.type === typeName
    );

    if (existingProduct) {
        existingProduct.quantity++;
    } else {
        cart.push({
            name: productName,
            type: typeName,
            price: price,
            quantity: 1
        });
    }

    updateCart();

    showNotification(
        `${productName} - ${typeName} đã được thêm vào giỏ hàng!`
    );
}

// =========================
// HIỂN THỊ THÔNG BÁO
// =========================

function showNotification(message) {

    const notification =
        document.getElementById("notification");

    const notificationText =
        document.getElementById("notificationText");

    notificationText.textContent = message;

    notification.classList.add("show");

    setTimeout(() => {

        notification.classList.remove("show");

    }, 2500);
}
// =========================
// CẬP NHẬT GIỎ
// =========================

function updateCart() {

    const cartItems = document.getElementById("cartItems");
    const cartTotal = document.getElementById("cartTotal");
    const cartCount = document.getElementById("cartCount");

    cartItems.innerHTML = "";

    let total = 0;
    let count = 0;


    if (cart.length === 0) {

        cartItems.innerHTML = `
            <p class="text-center">
                Giỏ hàng đang trống.
            </p>
        `;

        cartTotal.textContent = "0 VNĐ";

        if (cartCount) {
            cartCount.textContent = "0";
        }

        return;
    }


    cart.forEach((item, index) => {

        const itemTotal = item.price * item.quantity;

        total += itemTotal;
        count += item.quantity;


        cartItems.innerHTML += `

            <div class="cart-item">

                <div class="cart-item-info">

                    <h5>
                        ${item.name}
                    </h5>

                    <p>
                        Phân loại:
                        <strong>
                            ${item.type}
                        </strong>
                    </p>

                    <p>
                        Số lượng:
                        <strong>
                            ${item.quantity}
                        </strong>
                    </p>

                    <p>
                        Thành tiền:
                        <strong>
                            ${itemTotal.toLocaleString("vi-VN")} VNĐ
                        </strong>
                    </p>

                </div>


                <button
                    class="btn btn-danger btn-sm"
                    onclick="removeItem(${index})">

                    Xóa

                </button>

            </div>

        `;

    });


    // Cập nhật số lượng trên icon giỏ hàng
    if (cartCount) {
        cartCount.textContent = count;
    }


    // Tổng tiền toàn bộ giỏ hàng
    cartTotal.textContent =
        total.toLocaleString("vi-VN") + " VNĐ";
}


// =========================
// TĂNG SỐ LƯỢNG
// =========================

function increaseItem(index) {

    cart[index].quantity++;

    updateCart();
}


// =========================
// GIẢM SỐ LƯỢNG
// =========================

function decreaseItem(index) {

    cart[index].quantity--;

    if (cart[index].quantity <= 0) {

        cart.splice(index, 1);

    }

    updateCart();
}


// =========================
// XÓA SẢN PHẨM
// =========================

function removeItem(index) {

    cart.splice(index, 1);

    updateCart();
}


// =========================
// MỞ GIỎ HÀNG
// =========================

function openCart() {

    document.getElementById("cartModal").style.display =
        "flex";

}


// =========================
// ĐÓNG GIỎ HÀNG
// =========================

function closeCart() {

    document.getElementById("cartModal").style.display =
        "none";

}

// =========================
// BẢO VỆ HTML
// =========================

function escapeHTML(value) {

    if (typeof value !== "string") {
        return "";
    }

    return value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}





// =========================
// TẢI DỮ LIỆU SẢN PHẨM
// =========================

async function loadProductData() {

    try {

        const response = await fetch("./data/products.json");

        if (!response.ok) {
            throw new Error(
                `HTTP ${response.status} - Không thể tải products.json`
            );
        }

        productData = await response.json();

        productDataLoaded = true;

        console.log("✅ Đã tải products.json");
        console.log("🛍️ Dữ liệu sản phẩm:", productData);

    } catch (error) {

        productDataLoaded = false;

        console.error("❌ Lỗi tải products.json:", error);

        showNotification(
            "Không thể tải dữ liệu sản phẩm!"
        );
    }
}

loadProductData();





// =========================
// MỞ PHÂN LOẠI SẢN PHẨM
// =========================
function openProductModal(productId) {

    console.log("🛒 Đã click Mua ngay:", productId);

    if (!productDataLoaded) {
        console.error("❌ productData chưa được tải!");
        showNotification("Dữ liệu sản phẩm chưa được tải!");
        return;
    }

    const product = productData[productId];

    console.log("📦 Sản phẩm:", product);

    if (!product) {
        console.error("❌ Không tìm thấy sản phẩm:", productId);
        showNotification("Không tìm thấy sản phẩm!");
        return;
    }

    if (!product.types || product.types.length === 0) {
        console.error("❌ Sản phẩm không có phân loại!");
        showNotification("Sản phẩm chưa có phân loại!");
        return;
    }

    // Lưu sản phẩm hiện tại
    currentProduct = productId;

    // Reset số lượng
    productQuantity = 1;

    // =========================
    // TIÊU ĐỀ
    // =========================

    document.getElementById("productModalTitle").textContent =
        product.name;


    // =========================
    // HIỂN THỊ PHÂN LOẠI
    // =========================

    const productTypes =
        document.getElementById("productTypes");

    productTypes.innerHTML = "";


    product.types.forEach((type, index) => {

        productTypes.innerHTML += `

            <label class="product-type">

                <input
                    type="radio"
                    name="productType"
                    value="${escapeHTML(type.name)}"
                    ${index === 0 ? "checked" : ""}
                >

                <div class="product-type-content">

                    <strong>
                        ${escapeHTML(type.name)}
                    </strong>

                    <p>
                        ${escapeHTML(type.description || "")}
                    </p>

                    <span class="product-type-price">
                        ${Number(type.price).toLocaleString("vi-VN")} VNĐ
                    </span>

                </div>

            </label>

        `;

    });


    // =========================
    // RESET SỐ LƯỢNG
    // =========================

    document.getElementById("productQuantity").textContent = "1";


    // =========================
    // HIỆN MODAL
    // =========================

    document.getElementById("productModal").style.display = "flex";


    console.log("✅ Đã mở modal:", product.name);
}


// =========================
// Đóng phân loại sản phẩm
// =========================
function closeProductModal() {

    document.getElementById("productModal").style.display =
        "none";
}
function increaseProductQuantity() {

    productQuantity++;

    document.getElementById("productQuantity").textContent =
        productQuantity;
}
function decreaseProductQuantity() {

    if (productQuantity > 1) {

        productQuantity--;

    }

    document.getElementById("productQuantity").textContent =
        productQuantity;
}
// =========================
// THÊM SẢN PHẨM ĐÃ CHỌN VÀO GIỎ
// =========================

function addSelectedProductToCart() {

    if (!currentProduct) {

        console.error(
            "❌ Chưa có sản phẩm được chọn"
        );

        return;
    }


    const product =
        productData[currentProduct];


    if (!product) {

        console.error(
            "❌ Không tìm thấy sản phẩm:",
            currentProduct
        );

        return;
    }


    // =========================
    // LẤY PHÂN LOẠI ĐƯỢC CHỌN
    // =========================

    const selectedType =
        document.querySelector(
            'input[name="productType"]:checked'
        );


    if (!selectedType) {

        showNotification(
            "Vui lòng chọn phân loại sản phẩm!"
        );

        return;
    }


    // Tên phân loại
    const productType =
        selectedType.value;


    // =========================
    // TÌM DỮ LIỆU PHÂN LOẠI
    // =========================

    const selectedTypeData =
        product.types.find(
            type =>
                type.name === productType
        );


    if (!selectedTypeData) {

        console.error(
            "❌ Không tìm thấy phân loại:",
            productType
        );

        return;
    }


    // =========================
    // LẤY GIÁ
    // =========================

    const productPrice =
        Number(
            selectedTypeData.price
        );


    // =========================
    // KIỂM TRA ĐÃ CÓ TRONG GIỎ
    // =========================

    const existingProduct =
        cart.find(
            item =>
                item.productId ===
                currentProduct &&
                item.type ===
                productType
        );


    if (existingProduct) {

        existingProduct.quantity +=
            productQuantity;

    } else {

        cart.push({

            productId:
                currentProduct,

            name:
                product.name,

            type:
                productType,

            price:
                productPrice,

            quantity:
                productQuantity

        });

    }


    // =========================
    // DEBUG
    // =========================

    console.log(
        "🛒 Cart:",
        cart
    );


    // =========================
    // CẬP NHẬT GIỎ
    // =========================

    updateCart();


    // =========================
    // ĐÓNG MODAL
    // =========================

    closeProductModal();


    // =========================
    // THÔNG BÁO
    // =========================

    showNotification(

        product.name +
        " - " +
        productType +
        " - " +
        productPrice.toLocaleString("vi-VN") +
        " VNĐ × " +
        productQuantity +
        " đã được thêm vào giỏ hàng!"

    );


    // Reset số lượng
    productQuantity = 1;

}

// =========================
// DETAIL MODAL
// =========================
function openDetailModal(productId) {

    const product = productData[productId];

    if (!product) {
        console.error("Không tìm thấy sản phẩm:", productId);
        return;
    }

    const detail = product.detail || {};

    const modal = document.getElementById("detailModal");
    const title = document.getElementById("detailTitle");
    const content = document.getElementById("detailContent");

    if (!modal || !title || !content) {
        console.error("Không tìm thấy HTML của detail modal.");
        return;
    }

    title.textContent = product.name;

    /* =========================
       HÌNH ẢNH
    ========================= */

    let imagesHTML = "";

    if (Array.isArray(detail.images) && detail.images.length > 0) {

        detail.images.forEach((image, index) => {

            imagesHTML += `
                <div class="carousel-item ${index === 0 ? "active" : ""}">
                    <img 
                        src="${escapeHTML(image)}"
                        class="d-block w-100 detail-image"
                        alt="${escapeHTML(product.name)}"
                    >
                </div>
            `;

        });

    } else if (product.image) {

        imagesHTML = `
            <div class="carousel-item active">
                <img 
                    src="${escapeHTML(product.image)}"
                    class="d-block w-100 detail-image"
                    alt="${escapeHTML(product.name)}"
                >
            </div>
        `;

    } else {

        imagesHTML = `
            <div class="carousel-item active">
                <div class="text-center p-5">
                    Không có hình ảnh
                </div>
            </div>
        `;

    }


    /* =========================
       LỊCH SỬ
    ========================= */

    let historyHTML = "";

    if (Array.isArray(detail.history)) {

        detail.history.forEach(item => {

            historyHTML += `
                <p>${escapeHTML(item)}</p>
            `;

        });

    } else if (detail.history) {

        historyHTML = `
            <p>${escapeHTML(detail.history)}</p>
        `;

    }


    /* =========================
       QUY TRÌNH
       DÙNG ĐÚNG CSS CŨ
    ========================= */

    let processHTML = "";

    if (Array.isArray(detail.process)) {

        processHTML = `
            <div class="process-list">
        `;

        detail.process.forEach((item, index) => {

            processHTML += `
                <div class="process-item">

                    <span>${index + 1}</span>

                    <div>
                        <strong>${escapeHTML(item.name || "")}</strong>

                        <p>
                            ${escapeHTML(item.description || "")}
                        </p>
                    </div>

                </div>
            `;

        });

        processHTML += `
            </div>
        `;

    } else if (detail.process) {

        processHTML = `
            <p>${escapeHTML(detail.process)}</p>
        `;

    }


    /* =========================
       ĐIỂM NỔI BẬT
       DÙNG ĐÚNG CSS CŨ
    ========================= */

    let highlightsHTML = "";

    if (Array.isArray(detail.highlights)) {

        highlightsHTML = `
            <ul class="highlight-list">
        `;

        detail.highlights.forEach(item => {

            highlightsHTML += `
                <li>
                    <strong>${escapeHTML(item.title || "")}</strong>
                    ${item.description
                    ? `: ${escapeHTML(item.description)}`
                    : ""
                }
                </li>
            `;

        });

        highlightsHTML += `
            </ul>
        `;

    } else if (detail.highlights) {

        highlightsHTML = `
            <p>${escapeHTML(detail.highlights)}</p>
        `;

    }


    /* =========================
       HIỂN THỊ NỘI DUNG
    ========================= */

    content.innerHTML = `

        <!-- CAROUSEL -->
        <div id="productDetailCarousel" class="carousel slide mb-4">

            <div class="carousel-inner">
                ${imagesHTML}
            </div>

            <!-- DÙNG BUTTON CỦA BOOTSTRAP -->
            <button
                class="carousel-control-prev"
                type="button"
                data-bs-target="#productDetailCarousel"
                data-bs-slide="prev"
            >
                <span class="carousel-control-prev-icon"></span>
                <span class="visually-hidden">Previous</span>
            </button>

            <button
                class="carousel-control-next"
                type="button"
                data-bs-target="#productDetailCarousel"
                data-bs-slide="next"
            >
                <span class="carousel-control-next-icon"></span>
                <span class="visually-hidden">Next</span>
            </button>

        </div>


        <!-- ĐỊA CHỈ -->
        <div class="detail-section">

            <h4>Địa chỉ</h4>

            <p>
                ${escapeHTML(detail.address || "Chưa có thông tin")}
            </p>

        </div>


        <!-- TỔNG QUAN -->
        <div class="detail-section">

            <h4>Tổng quan</h4>

            <p>
                ${escapeHTML(detail.overview || "Chưa có thông tin")}
            </p>

        </div>


        <!-- LỊCH SỬ -->
        ${detail.history
            ? `
                <div class="detail-section">

                    <h4>Lịch sử</h4>

                    ${historyHTML}

                </div>
            `
            : ""
        }


        <!-- QUY TRÌNH -->
        ${detail.process
            ? `
                <div class="detail-section">

                    <h4>Quy trình</h4>

                    ${processHTML}

                </div>
            `
            : ""
        }


        <!-- ĐIỂM NỔI BẬT -->
        ${detail.highlights
            ? `
                <div class="detail-section">

                    <h4>Điểm nổi bật</h4>

                    ${highlightsHTML}

                </div>
            `
            : ""
        }

    `;


    /* =========================
       HIỂN THỊ MODAL
    ========================= */

    modal.style.display = "flex";
}
function previousDetailImage() {

    if (currentDetailImages.length === 0) {
        return;
    }

    currentDetailImageIndex--;

    // Nếu đang ở ảnh đầu tiên → quay về ảnh cuối
    if (currentDetailImageIndex < 0) {

        currentDetailImageIndex =
            currentDetailImages.length - 1;

    }

    updateDetailImage();
}
function nextDetailImage() {

    if (currentDetailImages.length === 0) {
        return;
    }

    currentDetailImageIndex++;

    // Nếu đang ở ảnh cuối → quay về ảnh đầu tiên
    if (
        currentDetailImageIndex >=
        currentDetailImages.length
    ) {

        currentDetailImageIndex = 0;

    }

    updateDetailImage();
}
function updateDetailImage() {

    const image =
        document.getElementById("detailMainImage");

    const counter =
        document.getElementById("detailImageCounter");


    if (!image) {
        return;
    }


    image.src =
        currentDetailImages[currentDetailImageIndex];


    if (counter) {

        counter.textContent =
            `${currentDetailImageIndex + 1} / ${currentDetailImages.length}`;

    }

}

// =========================
// ĐÓNG DETAIL MODAL
// =========================

function closeDetailModal() {

    document.getElementById("detailModal").style.display = "none";

}


/* =========================
   CHECKOUT
========================= */

function openCheckout() {

    // Kiểm tra giỏ hàng
    if (cart.length === 0) {

        showNotification("Giỏ hàng đang trống!");

        return;
    }


    const modal =
        document.getElementById("checkoutModal");


    const checkoutItems =
        document.getElementById("checkoutItems");


    const checkoutTotal =
        document.getElementById("checkoutTotal");


    let itemsHTML = "";

    let total = 0;


    /* =========================
       HIỂN THỊ SẢN PHẨM
    ========================= */

    cart.forEach(item => {

        const itemTotal =
            item.price * item.quantity;


        total += itemTotal;


        itemsHTML += `

            <div class="checkout-item">

                <div>

                    <strong>
                        ${escapeHTML(item.name)}
                    </strong>

                    <p>
                        Phân loại:
                        ${escapeHTML(item.type)}
                    </p>

                    <p>
                        Số lượng:
                        ${item.quantity}
                    </p>

                </div>


                <strong>
                    ${itemTotal.toLocaleString("vi-VN")} VNĐ
                </strong>

            </div>

        `;
    });


    checkoutItems.innerHTML = itemsHTML;


    checkoutTotal.textContent =
        `${total.toLocaleString("vi-VN")} VNĐ`;


    // Mở modal
    modal.style.display = "flex";


    // Hiển thị phương thức mặc định
    changePaymentMethod();
}

function closeCheckout() {

    const modal =
        document.getElementById("checkoutModal");

    modal.style.display = "none";
}

/* =========================
   CHANGE PAYMENT METHOD
========================= */

function changePaymentMethod() {

    const paymentMethod =
        document.querySelector(
            'input[name="paymentMethod"]:checked'
        )?.value;


    const paymentInfo =
        document.getElementById("paymentInfo");


    if (!paymentInfo) return;


    /* =========================
       NGÂN HÀNG
    ========================= */

    if (paymentMethod === "bank") {

        paymentInfo.innerHTML = `

            <div class="payment-detail">

                <h5>
                    🏦 Thông tin chuyển khoản
                </h5>

                <p>
                    <strong>Ngân hàng:</strong>
                    Vietcombank
                </p>

                <p>
                    <strong>Số tài khoản:</strong>
                    0123456789
                </p>

                <p>
                    <strong>Chủ tài khoản:</strong>
                    HUE HERITAGE 360
                </p>

            </div>

        `;
    }


    /* =========================
       MOMO
    ========================= */

    if (paymentMethod === "momo") {

        paymentInfo.innerHTML = `

            <div class="payment-detail">

                <h5>
                    💗 Thông tin MoMo
                </h5>

                <p>
                    <strong>Số điện thoại MoMo:</strong>
                    0123456789
                </p>

                <p>
                    <strong>Người nhận:</strong>
                    HUE HERITAGE 360
                </p>

            </div>

        `;
    }
}
/* =========================
   CONFIRM ORDER
========================= */

function confirmOrder() {

    const name =
        document.getElementById("customerName")
            .value.trim();


    const phone =
        document.getElementById("customerPhone")
            .value.trim();


    const address =
        document.getElementById("customerAddress")
            .value.trim();


    const paymentMethod =
        document.querySelector(
            'input[name="paymentMethod"]:checked'
        )?.value;


    /* =========================
       KIỂM TRA
    ========================= */

    if (!name) {

        showNotification(
            "Vui lòng nhập họ và tên!"
        );

        return;
    }


    if (!phone) {

        showNotification(
            "Vui lòng nhập số điện thoại!"
        );

        return;
    }


    if (!address) {

        showNotification(
            "Vui lòng nhập địa chỉ!"
        );

        return;
    }


    /* =========================
       TÍNH TỔNG
    ========================= */

    let total = 0;


    cart.forEach(item => {

        total +=
            item.price * item.quantity;

    });


    /* =========================
       TẠO ĐƠN HÀNG
    ========================= */

    const order = {

        id: "DH" + Date.now(),

        customer: {

            name: name,

            phone: phone,

            address: address

        },

        paymentMethod: paymentMethod,

        items: [...cart],

        total: total,

        createdAt:
            new Date().toISOString()

    };


    console.log("Đơn hàng:", order);


    /* =========================
       LƯU ĐƠN HÀNG
    ========================= */

    localStorage.setItem(
        "lastOrder",
        JSON.stringify(order)
    );


    /* =========================
       XÓA GIỎ HÀNG
    ========================= */

    cart = [];

    updateCart();


    /* =========================
       ĐÓNG MODAL
    ========================= */

    closeCheckout();


    /* =========================
       THÔNG BÁO
    ========================= */

    showNotification(
        "Đặt hàng thành công!"
    );


    /* =========================
       RESET FORM
    ========================= */

    document.getElementById("customerName").value = "";

    document.getElementById("customerPhone").value = "";

    document.getElementById("customerAddress").value = "";

}




/* =========================
   LOAD SERVICES
========================= */

async function loadServices() {

    try {

        const response =
            await fetch("./data/services.json");


        if (!response.ok) {

            throw new Error(
                "Không thể tải services.json"
            );

        }


        servicesData =
            await response.json();


        console.log(
            "✅ Đã tải services:",
            servicesData
        );


        loadHotels();

        loadTours();


    } catch (error) {

        console.error(
            "❌ Lỗi tải services:",
            error
        );

    }

}


/* =========================
   LOAD KHÁCH SẠN + HOMESTAY
========================= */

function loadHotels() {

    const container =
        document.getElementById("hotelCards");

    const template =
        document.getElementById("hotelCardTemplate");


    if (!container || !template) {

        console.error(
            "❌ Không tìm thấy hotelCards hoặc hotelCardTemplate"
        );

        return;

    }


    container.innerHTML = "";


    const hotels = [

        ...(servicesData["khach-san"] || []),

        ...(servicesData["homestay"] || [])

    ];


    hotels.forEach(service => {

        const card =
            template.content.cloneNode(true);


        const serviceCard =
            card.querySelector(".service-card");


        serviceCard.dataset.serviceId =
            service.id;


        /* =========================
           ẢNH
        ========================= */

        const image =
            card.querySelector(
                '[data-field="image"]'
            );


        image.src =
            service.image;

        image.alt =
            service.name;


        /* =========================
           LOẠI
        ========================= */

        card.querySelector(
            '[data-field="type"]'
        ).textContent =
            service.type;


        /* =========================
           TÊN
        ========================= */

        card.querySelector(
            '[data-field="name"]'
        ).textContent =
            service.name;


        /* =========================
           ĐỊA CHỈ
        ========================= */

        card.querySelector(
            '[data-field="address"]'
        ).textContent =
            `📍 ${service.address}`;


        /* =========================
           XEM PHÒNG
        ========================= */

        card.querySelector(
            '[data-action="rooms"]'
        ).addEventListener(
            "click",
            () => viewRooms(service.id)
        );


        /* =========================
           CHI TIẾT
        ========================= */

        card.querySelector(
            '[data-action="detail"]'
        ).addEventListener(
            "click",
            () => {

                if (service.link) {

                    window.open(
                        service.link,
                        "_blank"
                    );

                } else {

                    console.warn(
                        "⚠️ Dịch vụ chưa có link:",
                        service.name
                    );

                }

            }
        );


        container.appendChild(card);

    });

}


/* =========================
   LOAD TOUR
========================= */

function loadTours() {

    const container =
        document.getElementById("tourCards");

    const template =
        document.getElementById("tourCardTemplate");


    if (!container || !template) {

        console.error(
            "❌ Không tìm thấy tourCards hoặc tourCardTemplate"
        );

        return;

    }


    container.innerHTML = "";


    const tours =
        servicesData["tour"] || [];


    tours.forEach(tour => {

        const card =
            template.content.cloneNode(true);


        const serviceCard =
            card.querySelector(".service-card");


        serviceCard.dataset.serviceId =
            tour.id;


        /* =========================
           ẢNH
        ========================= */

        const image =
            card.querySelector(
                '[data-field="image"]'
            );


        image.src =
            tour.image;

        image.alt =
            tour.name;


        /* =========================
           LOẠI
        ========================= */

        card.querySelector(
            '[data-field="type"]'
        ).textContent =
            tour.type;


        /* =========================
           TÊN
        ========================= */

        card.querySelector(
            '[data-field="name"]'
        ).textContent =
            tour.name;


        /* =========================
           ĐỊA ĐIỂM
        ========================= */

        card.querySelector(
            '[data-field="location"]'
        ).textContent =
            `📍 ${tour.location}`;


        /* =========================
           THỜI LƯỢNG
        ========================= */

        card.querySelector(
            '[data-field="duration"]'
        ).textContent =
            `⏱️ ${tour.duration}`;


        /* =========================
           ĐẶT TOUR
        ========================= */

        card.querySelector(
            '[data-action="book"]'
        ).addEventListener(
            "click",
            () => bookTour(tour.id)
        );


        /* =========================
           CHI TIẾT
        ========================= */

        card.querySelector(
            '[data-action="detail"]'
        ).addEventListener(
            "click",
            () => viewServiceDetail(tour.id)
        );


        container.appendChild(card);

    });

}


/* =========================
   ĐẶT TOUR
========================= */

function bookTour(tourId) {

    const tours =
        servicesData["tour"] || [];

    const tour =
        tours.find(
            item => item.id === tourId
        );

    if (!tour) {

        console.error(
            "❌ Không tìm thấy tour:",
            tourId
        );

        return;
    }

    // Lưu tour đang được đặt
    currentBookingTour = tour;

    console.log(
        "🗺️ Tour đang đặt:",
        tour
    );


    /* =========================
       HIỂN THỊ THÔNG TIN TOUR
    ========================= */

    document.getElementById(
        "tourBookingName"
    ).textContent = tour.name;


    document.getElementById(
        "tourBookingLocation"
    ).textContent =
        `📍 ${tour.location}`;


    document.getElementById(
        "tourBookingDuration"
    ).textContent =
        `⏱️ ${tour.duration}`;


    /* =========================
       NGÀY ĐẶT TOUR
    ========================= */

    const tourDate =
        document.getElementById(
            "tourDate"
        );


    /*
       Tour phải đặt trước ít nhất 1 ngày
       => ngày nhỏ nhất = ngày mai
    */

    const tomorrow =
        new Date();

    tomorrow.setDate(
        tomorrow.getDate() + 1
    );


    const minDate =
        tomorrow.getFullYear() +
        "-" +
        String(
            tomorrow.getMonth() + 1
        ).padStart(2, "0") +
        "-" +
        String(
            tomorrow.getDate()
        ).padStart(2, "0");


    tourDate.min = minDate;

    // Reset ngày cũ
    tourDate.value = "";


    // Xóa lỗi
    document.getElementById(
        "tourDateError"
    ).style.display = "none";


    /* =========================
       RESET CÁC BƯỚC
    ========================= */

    document.getElementById(
        "tourBookingStep1"
    ).style.display = "block";


    document.getElementById(
        "tourBookingStep2"
    ).style.display = "none";


    document.getElementById(
        "tourBookingStep3"
    ).style.display = "none";


    /* =========================
       MỞ MODAL
    ========================= */

    const modalElement =
        document.getElementById(
            "tourBookingModal"
        );


    if (!modalElement) {

        console.error(
            "❌ Không tìm thấy tourBookingModal"
        );

        return;
    }


    const modal =
        new bootstrap.Modal(
            modalElement
        );


    modal.show();
}

/* =========================
   XÁC NHẬN NGÀY ĐẶT TOUR
========================= */

function confirmTourDate() {

    const tourDate =
        document.getElementById(
            "tourDate"
        ).value;


    const error =
        document.getElementById(
            "tourDateError"
        );


    /* =========================
       KIỂM TRA TOUR
    ========================= */

    if (!currentBookingTour) {

        error.textContent =
            "❌ Không tìm thấy thông tin tour.";

        error.style.display = "block";

        return;
    }


    /* =========================
       KIỂM TRA NGÀY
    ========================= */

    if (!tourDate) {

        error.textContent =
            "⚠️ Vui lòng chọn ngày đặt tour.";

        error.style.display = "block";

        return;
    }


    /* =========================
       NGÀY TỐI THIỂU
    ========================= */

    const tomorrow =
        new Date();

    tomorrow.setDate(
        tomorrow.getDate() + 1
    );


    const minDate =
        tomorrow.getFullYear() +
        "-" +
        String(
            tomorrow.getMonth() + 1
        ).padStart(2, "0") +
        "-" +
        String(
            tomorrow.getDate()
        ).padStart(2, "0");


    console.log(
        "📅 Ngày tối thiểu:",
        minDate
    );

    console.log(
        "📅 Ngày tour:",
        tourDate
    );


    if (tourDate < minDate) {

        error.textContent =
            "⚠️ Tour phải được đặt trước ít nhất 1 ngày.";

        error.style.display = "block";

        return;
    }


    /* =========================
       LƯU NGÀY
    ========================= */

    tourBookingData.tourDate =
        tourDate;


    /* =========================
       HIỂN THỊ XÁC NHẬN
    ========================= */

    document.getElementById(
        "confirmTourName"
    ).textContent =
        currentBookingTour.name;


    document.getElementById(
        "confirmTourLocation"
    ).textContent =
        currentBookingTour.location;


    document.getElementById(
        "confirmTourDate"
    ).textContent =
        formatDate(tourDate);


    /* =========================
       CHUYỂN SANG BƯỚC 2
    ========================= */

    document.getElementById(
        "tourBookingStep1"
    ).style.display = "none";


    document.getElementById(
        "tourBookingStep2"
    ).style.display = "block";


    error.style.display = "none";


    console.log(
        "✅ Đã chuyển sang xác nhận đặt tour"
    );
}

/* =========================
   QUAY LẠI CHỌN NGÀY TOUR
========================= */

function backToTourDate() {

    document.getElementById(
        "tourBookingStep2"
    ).style.display = "none";


    document.getElementById(
        "tourBookingStep1"
    ).style.display = "block";
}
/* =========================
   HOÀN TẤT ĐẶT TOUR
========================= */

function completeTourBooking() {

    if (!currentBookingTour) {

        console.error(
            "❌ Không có thông tin tour."
        );

        return;
    }


    if (!tourBookingData.tourDate) {

        console.error(
            "❌ Chưa có ngày đặt tour."
        );

        return;
    }


    /* =========================
       TẠO MÃ ĐẶT TOUR
    ========================= */

    const bookingId =
        "TOUR-" +
        Date.now()
            .toString()
            .slice(-8);


    /* =========================
       TẠO DỮ LIỆU ĐẶT TOUR
    ========================= */

    const booking = {

        bookingId: bookingId,

        tourId:
            currentBookingTour.id,

        tourName:
            currentBookingTour.name,

        location:
            currentBookingTour.location,

        duration:
            currentBookingTour.duration,

        tourDate:
            tourBookingData.tourDate,

        createdAt:
            new Date().toISOString()
    };


    console.log(
        "🗺️ Đặt tour:",
        booking
    );


    /* =========================
       LƯU LOCAL STORAGE
    ========================= */

    localStorage.setItem(
        "tourBooking",
        JSON.stringify(booking)
    );


    /* =========================
       HIỂN THỊ THÀNH CÔNG
    ========================= */

    document.getElementById(
        "tourBookingStep2"
    ).style.display = "none";


    document.getElementById(
        "tourBookingStep3"
    ).style.display = "block";


    document.getElementById(
        "tourBookingSuccessId"
    ).textContent =
        booking.bookingId;


    document.getElementById(
        "tourBookingSuccessDate"
    ).textContent =
        formatDate(
            booking.tourDate
        );


    console.log(
        "✅ Đặt tour thành công!"
    );
}

/* =========================
   CHUYỂN TAB
========================= */

function showService(type, button) {

    const hotelServices =
        document.getElementById(
            "hotelServices"
        );

    const tourServices =
        document.getElementById(
            "tourServices"
        );

    const workshopServices =
        document.getElementById(
            "workshopServices"
        );


    /* Ẩn tất cả */

    hotelServices.style.display =
        "none";

    tourServices.style.display =
        "none";

    workshopServices.style.display =
        "none";


    /* Hiển thị tab */

    if (type === "hotel") {

        hotelServices.style.display =
            "block";

    }


    if (type === "tour") {

        tourServices.style.display =
            "block";

    }


    if (type === "workshop") {

        workshopServices.style.display =
            "block";

    }


    /* Đổi button */

    document
        .querySelectorAll(".service-btn")
        .forEach(btn => {

            btn.classList.remove(
                "btn-success"
            );

            btn.classList.add(
                "btn-outline-success"
            );

        });


    button.classList.remove(
        "btn-outline-success"
    );

    button.classList.add(
        "btn-success"
    );

}

loadServices();


/* =========================
   ĐẶT PHÒNG
========================= */



function viewRooms(serviceId) {

    const hotels = [
        ...(servicesData["khach-san"] || []),
        ...(servicesData["homestay"] || [])
    ];

    const hotel = hotels.find(
        service => service.id === serviceId
    );


    if (!hotel) {

        console.error(
            "❌ Không tìm thấy khách sạn:",
            serviceId
        );

        return;
    }


    currentBookingHotel = hotel;


    /* =========================
       HIỂN THỊ THÔNG TIN
    ========================= */

    document.getElementById(
        "bookingHotelName"
    ).textContent = hotel.name;


    document.getElementById(
        "bookingHotelAddress"
    ).textContent =
        `📍 ${hotel.address}`;


    /* =========================
       NGÀY HIỆN TẠI
    ========================= */

    const today =
        new Date().toISOString().split("T")[0];


    const checkIn =
        document.getElementById("checkInDate");

    const checkOut =
        document.getElementById("checkOutDate");


    /*
       Không cho chọn ngày trước hôm nay
    */

    checkIn.min = today;

    checkOut.min = today;


    /* =========================
       RESET
    ========================= */

    checkIn.value = "";

    checkOut.value = "";


    document.getElementById(
        "bookingDateError"
    ).style.display = "none";


    document.getElementById(
        "bookingStep1"
    ).style.display = "block";


    document.getElementById(
        "bookingStep2"
    ).style.display = "none";


    document.getElementById(
        "bookingStep3"
    ).style.display = "none";


    /* =========================
       MỞ MODAL
    ========================= */

    const modalElement =
        document.getElementById(
            "roomBookingModal"
        );


    const modal =
        new bootstrap.Modal(modalElement);


    modal.show();
}

function confirmBookingDate() {

    const checkIn =
        document.getElementById(
            "checkInDate"
        ).value;


    const checkOut =
        document.getElementById(
            "checkOutDate"
        ).value;


    const error =
        document.getElementById(
            "bookingDateError"
        );


    /* =========================
       KIỂM TRA NGÀY
    ========================= */

    if (!checkIn || !checkOut) {

        error.textContent =
            "⚠️ Vui lòng chọn đầy đủ ngày nhận và trả phòng.";

        error.style.display = "block";

        return;
    }


    /* =========================
       HÔM NAY
    ========================= */

    const today =
        new Date().toISOString().split("T")[0];


    if (checkIn < today) {

        error.textContent =
            "⚠️ Ngày nhận phòng phải từ hôm nay trở đi.";

        error.style.display = "block";

        return;
    }


    /* =========================
       TRẢ PHÒNG PHẢI SAU NHẬN PHÒNG
    ========================= */

    if (checkOut <= checkIn) {

        error.textContent =
            "⚠️ Ngày trả phòng phải sau ngày nhận phòng.";

        error.style.display = "block";

        return;
    }


    /* =========================
       LƯU DỮ LIỆU
    ========================= */

    bookingData.checkIn = checkIn;

    bookingData.checkOut = checkOut;


    /* =========================
       HIỂN THỊ XÁC NHẬN
    ========================= */

    document.getElementById(
        "confirmHotelName"
    ).textContent =
        currentBookingHotel.name;

    document.getElementById(
        "confirmHotelAddress"
    ).textContent =
        currentBookingHotel.address;

    document.getElementById(
        "confirmCheckIn"
    ).textContent =
        formatDate(checkIn);


    document.getElementById(
        "confirmCheckOut"
    ).textContent =
        formatDate(checkOut);


    /* =========================
       CHUYỂN SANG BƯỚC 2
    ========================= */

    document.getElementById(
        "bookingStep1"
    ).style.display = "none";


    document.getElementById(
        "bookingStep2"
    ).style.display = "block";


    error.style.display = "none";
}
function formatDate(dateString) {

    const [year, month, day] =
        dateString.split("-");

    return `${day}/${month}/${year}`;
}
function backToBookingDate() {

    document.getElementById(
        "bookingStep2"
    ).style.display = "none";


    document.getElementById(
        "bookingStep1"
    ).style.display = "block";
}
async function completeBooking() {

    /* =========================
       KIỂM TRA KHÁCH SẠN
    ========================= */

    if (!currentBookingHotel) {

        console.error(
            "❌ Không có thông tin khách sạn"
        );

        return;
    }


    /* =========================
       LẤY EMAIL
    ========================= */

    const emailInput =
        document.getElementById(
            "bookingEmail"
        );


    const email =
        emailInput.value.trim();


    const emailError =
        document.getElementById(
            "bookingEmailError"
        );


    /* =========================
       KIỂM TRA EMAIL
    ========================= */

    if (!email) {

        emailError.textContent =
            "⚠️ Vui lòng nhập email.";

        emailError.style.display =
            "block";

        emailInput.focus();

        return;
    }


    const emailRegex =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


    if (!emailRegex.test(email)) {

        emailError.textContent =
            "⚠️ Email không hợp lệ.";

        emailError.style.display =
            "block";

        emailInput.focus();

        return;
    }


    emailError.style.display =
        "none";


    /* =========================
       TẠO MÃ ĐẶT PHÒNG
    ========================= */

    const bookingId =
        "HUE-" +
        Date.now().toString().slice(-8);


    /* =========================
       DỮ LIỆU ĐẶT PHÒNG
    ========================= */

    const booking = {

        bookingId: bookingId,

        hotelId:
            currentBookingHotel.id,

        hotelName:
            currentBookingHotel.name,

        address:
            currentBookingHotel.address,

        checkIn:
            bookingData.checkIn,

        checkOut:
            bookingData.checkOut,

        email:
            email,

        createdAt:
            new Date().toISOString()

    };


    console.log(
        "📋 Thông tin đặt phòng:",
        booking
    );


    /* =========================
       KHÓA NÚT
    ========================= */

    const button =
        document.getElementById(
            "confirmBookingButton"
        );


    button.disabled = true;

    button.textContent =
        "⏳ Đang gửi email...";


    try {

        /* =========================
           GỬI EMAIL
        ========================= */

        const response =
            await emailjs.send(

                "service_ve9xl6a",

                "template_dtndthc",

                {

                    to_email:
                        booking.email,

                    booking_id:
                        booking.bookingId,

                    hotel_name:
                        booking.hotelName,

                    hotel_address:
                        booking.address,

                    check_in:
                        formatDate(
                            booking.checkIn
                        ),

                    check_out:
                        formatDate(
                            booking.checkOut
                        )

                }

            );


        console.log(
            "✅ Email đã gửi thành công:",
            response
        );


        /* =========================
           LƯU ĐẶT PHÒNG
        ========================= */

        localStorage.setItem(
            "hotelBooking",
            JSON.stringify(booking)
        );


        /* =========================
           HIỂN THỊ THÀNH CÔNG
        ========================= */

        document.getElementById(
            "bookingStep2"
        ).style.display = "none";


        document.getElementById(
            "bookingStep3"
        ).style.display = "block";


        /* =========================
           HIỂN THỊ MÃ ĐẶT PHÒNG
        ========================= */

        document.getElementById(
            "bookingSuccessId"
        ).textContent =
            booking.bookingId;


    } catch (error) {

        console.error(
            "❌ Lỗi gửi email:",
            error
        );


        emailError.textContent =
            "❌ Không thể gửi email. Vui lòng thử lại.";

        emailError.style.display =
            "block";


        button.disabled = false;

        button.textContent =
            "Xác nhận đặt phòng";

    }

}