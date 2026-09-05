
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

function showPlace(id) {

    // Tìm di tích trong heritage.json
    const place = heritageData.find(
        place =>
            String(place.id) === String(id)
    );

    if (!place) {

        console.error(
            "❌ Không tìm thấy di tích:",
            id
        );

        return;
    }


    // =========================
    // TÊN
    // =========================

    document.getElementById(
        "placeModalTitle"
    ).textContent =
        place.name;

    document.getElementById(
        "placeName"
    ).textContent =
        place.name;


    // =========================
    // ĐỊA ĐIỂM
    // =========================

    document.getElementById(
        "placeLocation"
    ).textContent =
        place.address ||
        "Chưa có địa chỉ";


    // =========================
    // MÔ TẢ
    // =========================

    document.getElementById(
        "placeDescription"
    ).textContent =
        place.description ||
        "Chưa có mô tả.";


    // =========================
    // THÔNG TIN
    // =========================

    const infoElement =
        document.getElementById(
            "placeInfo"
        );

    infoElement.innerHTML = "";


    // Hiển thị loại di tích
    if (place.type) {

        const li =
            document.createElement("li");

        li.textContent =
            `Loại hình: ${place.type}`;

        infoElement.appendChild(li);

    }


    // =========================
    // GALLERY
    // =========================

    const carouselImages =
        document.getElementById(
            "carouselImages"
        );

    carouselImages.innerHTML = "";


    if (
        place.images &&
        place.images.length > 0
    ) {

        place.images.forEach(
            (image, index) => {

                const div =
                    document.createElement("div");

                div.className =
                    index === 0
                        ? "carousel-item active"
                        : "carousel-item";


                div.innerHTML = `
                    <img
                        src="${image}"
                        class="d-block w-100"
                        alt="${place.name}"
                    >
                `;

                carouselImages.appendChild(div);

            }
        );

    } else {

        carouselImages.innerHTML = `
            <div class="carousel-item active">

                <div class="text-center p-5">

                    Chưa có hình ảnh

                </div>

            </div>
        `;
    }


    // =========================
    // MỞ MODAL
    // =========================

    const modalElement =
        document.getElementById(
            "placeModal"
        );

    const modal =
        bootstrap.Modal.getOrCreateInstance(
            modalElement
        );

    modal.show();
}



// =========================
// MỞ CAMERA
// =========================

async function openCamera() {

    const modalElement =
        document.getElementById("cameraModal");

    const modal =
        new bootstrap.Modal(modalElement);

    modal.show();


    // Tắt nút chụp khi chưa có GPS
    document.getElementById("takePhotoButton")
        .disabled = true;


    // Mở camera
    startCamera();

    // Xin GPS ngay lập tức
    getUserLocation();
}

// =========================
// START CAMERA
// =========================

async function startCamera() {

    try {

        // Nếu camera cũ đang chạy thì tắt
        stopCamera();

        cameraStream =
            await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: {
                        ideal: currentCamera
                    }
                },
                audio: false
            });

        const video =
            document.getElementById("camera");

        video.srcObject = cameraStream;

        video.style.display = "block";

    } catch (error) {

        console.error(error);

        alert("Không thể truy cập camera.");

    }
}


// =========================
// ĐỔI CAMERA
// =========================

function switchCamera() {

    if (currentCamera === "user") {

        currentCamera = "environment";

    } else {

        currentCamera = "user";

    }

    console.log(
        "📷 Đổi sang camera:",
        currentCamera
    );

    startCamera();
}


// =========================
// CHỤP ẢNH
// =========================

function takePhoto() {

    const video =
        document.getElementById("camera");

    const canvas =
        document.getElementById("photo");

    const photoContainer =
        document.getElementById("photoContainer");

    const context =
        canvas.getContext("2d");

    // Chụp ảnh
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    context.drawImage(
        video,
        0,
        0,
        canvas.width,
        canvas.height
    );

    // Ẩn camera
    video.style.display = "none";

    // Hiện ảnh
    photoContainer.style.display = "block";

    // Ẩn nút chụp
    document.getElementById(
        "takePhotoButton"
    ).style.display = "none";

    // Ẩn nút đổi camera
    document.getElementById(
        "switchCameraButton"
    ).style.display = "none";

    // Hiện nút chụp lại
    document.getElementById(
        "retakeButton"
    ).style.display = "inline-block";

    // Tắt camera
    stopCamera();

    // Nếu GPS đã sẵn sàng thì tìm di tích
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


// Dung scan
function stopScanEffect() {

    const photoContainer =
        document.getElementById(
            "photoContainer"
        );

    photoContainer.classList.remove(
        "scanning"
    );
}


// =========================
// TẮT CAMERA
// =========================

function stopCamera() {

    // Tắt camera
    if (cameraStream) {

        cameraStream
            .getTracks()
            .forEach(track => {
                track.stop();
            });

        cameraStream = null;
    }

    // Chỉ xóa stream camera
    const video =
        document.getElementById("camera");

    if (video) {
        video.srcObject = null;
    }
}


// =========================
// LẤY GPS
// =========================

function getUserLocation() {

    const status =
        document.getElementById("locationStatus");


    status.style.display = "block";

    status.innerHTML = `
        <p class="text-primary">
            📍 Đang xác định vị trí...
        </p>
    `;


    // Kiểm tra trình duyệt
    if (!navigator.geolocation) {

        showLocationError(
            "Thiết bị không hỗ trợ định vị."
        );

        return;
    }


    navigator.geolocation.getCurrentPosition(

        function (position) {

            // Lưu GPS
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


            // GPS OK
            status.innerHTML = `
                <p class="text-success">
                    ✅ Vị trí đã sẵn sàng
                </p>
            `;


            // Cho phép chụp
            document.getElementById("takePhotoButton")
                .disabled = false;

        },


        function (error) {

            console.error(error);


            if (error.code === 1) {

                showLocationError(
                    "Bạn cần cho phép ứng dụng sử dụng vị trí."
                );

            }

            else if (error.code === 2) {

                showLocationError(
                    "Không thể xác định vị trí. Hãy bật định vị trên thiết bị."
                );

            }

            else if (error.code === 3) {

                showLocationError(
                    "Lấy vị trí quá lâu. Hãy kiểm tra GPS và thử lại."
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

// =========================
// BÁO LỖI GPS
// =========================

function showLocationError(message) {

    const status =
        document.getElementById("locationStatus");


    status.style.display = "block";


    status.innerHTML = `
        <div class="text-danger">

            <p>
                ⚠️ ${message}
            </p>

            <button
                type="button"
                class="btn btn-primary"
                onclick="getUserLocation()">

                🔄 Thử lại

            </button>

        </div>
    `;


    // Không cho chụp khi chưa có GPS
    document.getElementById("takePhotoButton")
        .disabled = true;
}

// =========================
// CHỤP LẠI
// =========================

function retakePhoto() {

    const video =
        document.getElementById("camera");

    const photoContainer =
        document.getElementById("photoContainer");

    const status =
        document.getElementById("locationStatus");

    // =========================
    // XÓA ẢNH LẦN TRƯỚC
    // =========================

    clearCameraData();

    // Hủy timer scan cũ
    if (scanTimer) {

        clearTimeout(scanTimer);

        scanTimer = null;
    }

    // Dừng hiệu ứng scan
    stopScanEffect();

    // Ẩn ảnh cũ
    photoContainer.style.display = "none";

    // Hiện camera
    video.style.display = "block";

    // Hiện nút chụp
    document.getElementById(
        "takePhotoButton"
    ).style.display = "inline-block";

    // Hiện lại nút đổi camera
    document.getElementById(
        "switchCameraButton"
    ).style.display = "inline-block";

    // Ẩn nút chụp lại
    document.getElementById(
        "retakeButton"
    ).style.display = "none";

    // Giữ trạng thái GPS
    if (
        userLatitude !== null &&
        userLongitude !== null
    ) {

        status.style.display = "block";

        status.innerHTML = `
            <p class="text-success">
                ✅ Vị trí đã sẵn sàng
            </p>
        `;

    } else {

        getUserLocation();
    }

    // Mở lại camera
    startCamera();
}

// =========================
// TÍNH KHOẢNG CÁCH GPS
// =========================

function calculateDistance(
    lat1,
    lon1,
    lat2,
    lon2
) {

    // Ép tất cả về Number
    lat1 = Number(lat1);
    lon1 = Number(lon1);
    lat2 = Number(lat2);
    lon2 = Number(lon2);

    // Kiểm tra dữ liệu
    if (
        !Number.isFinite(lat1) ||
        !Number.isFinite(lon1) ||
        !Number.isFinite(lat2) ||
        !Number.isFinite(lon2)
    ) {

        console.error(
            "❌ Tọa độ không hợp lệ:",
            {
                lat1,
                lon1,
                lat2,
                lon2
            }
        );

        return NaN;
    }

    const R = 6371000;

    const toRadians =
        degrees =>
            degrees * Math.PI / 180;

    const dLat =
        toRadians(lat2 - lat1);

    const dLon =
        toRadians(lon2 - lon1);

    const a =
        Math.sin(dLat / 2) *
        Math.sin(dLat / 2) +

        Math.cos(
            toRadians(lat1)
        ) *

        Math.cos(
            toRadians(lat2)
        ) *

        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c =
        2 *
        Math.atan2(
            Math.sqrt(a),
            Math.sqrt(1 - a)
        );

    const distance =
        R * c;

    return distance;
}


// =========================
// LOAD DỮ LIỆU DI TÍCH
// =========================

async function loadHeritageData() {

    try {

        const response =
            await fetch(
                "./data/heritage.json"
            );

        if (!response.ok) {

            throw new Error(
                `HTTP ${response.status} `
            );
        }

        heritageData =
            await response.json();

        heritageDataLoaded = true;

        console.log(
            "✅ Đã tải dữ liệu di tích:",
            heritageData
        );

    } catch (error) {

        heritageDataLoaded = false;

        console.error(
            "❌ Không thể tải dữ liệu di tích:",
            error
        );
    }
}
loadHeritageData();




// =========================
// Tim di tich gan
// =========================
function findNearestHeritage(
    latitude,
    longitude
) {

    const status =
        document.getElementById(
            "locationStatus"
        );

    // =========================
    // KIỂM TRA GPS
    // =========================

    latitude = Number(latitude);
    longitude = Number(longitude);

    console.log("📍 GPS người dùng:");
    console.log("Latitude:", latitude);
    console.log("Longitude:", longitude);

    if (
        !Number.isFinite(latitude) ||
        !Number.isFinite(longitude)
    ) {

        console.error(
            "❌ GPS không hợp lệ"
        );

        status.innerHTML = `
            <p class="text-danger">
                ❌ Tọa độ GPS không hợp lệ.
            </p>
        `;

        return null;
    }

    // =========================
    // KIỂM TRA DATA
    // =========================

    if (!heritageDataLoaded) {

        console.error(
            "❌ Dữ liệu di tích chưa được tải"
        );

        status.innerHTML = `
            <p class="text-danger">
                ❌ Dữ liệu di tích chưa sẵn sàng.
            </p>
        `;

        return null;
    }

    if (heritageData.length === 0) {

        console.error(
            "❌ Không có dữ liệu di tích"
        );

        status.innerHTML = `
            <p class="text-danger">
                ❌ Không có dữ liệu di tích.
            </p>
        `;

        return null;
    }

    // =========================
    // TÍNH KHOẢNG CÁCH
    // =========================

    const places = heritageData
        .map(place => {

            const distance =
                calculateDistance(
                    latitude,
                    longitude,
                    Number(place.latitude),
                    Number(place.longitude)
                );

            return {
                ...place,
                distance: distance
            };

        })
        .filter(place =>
            Number.isFinite(place.distance)
        );

    // =========================
    // SẮP XẾP GẦN → XA
    // =========================

    places.sort(
        (a, b) =>
            a.distance - b.distance
    );

    // =========================
    // DEBUG
    // =========================

    console.log(
        "🏛️ Khoảng cách tới các di tích:"
    );

    places.forEach(place => {

        console.log(
            `${place.name}: ${Math.round(
                place.distance
            )} m`
        );

    });

    // =========================
    // DI TÍCH GẦN NHẤT
    // =========================

    const nearestPlace =
        places[0];

    console.log(
        "🏯 DI TÍCH GẦN NHẤT:",
        nearestPlace.name
    );

    console.log(
        "📏 KHOẢNG CÁCH:",
        Math.round(
            nearestPlace.distance
        ),
        "m"
    );

    // =========================
    // GIỚI HẠN KHOẢNG CÁCH
    // =========================

    const MAX_DISTANCE = 2000000;

    if (
        nearestPlace.distance >
        MAX_DISTANCE
    ) {

        status.innerHTML = `
            <div class="text-warning">

                <p>
                    ⚠️ Bạn chưa ở gần
                    di tích được hỗ trợ.
                </p>

                <p>
                    Di tích gần nhất:
                    <strong>
                        ${escapeHTML(
            nearestPlace.name
        )}
                    </strong>
                </p>

                <p>
                    📏 Khoảng cách:
                    ${Math.round(
            nearestPlace.distance
        )} m
                </p>

            </div>
        `;

        return null;
    }

    // =========================
    // ĐÃ TÌM THẤY
    // =========================

    status.innerHTML = `
        <div class="text-success">

            <p>
                ✅ Đã xác định di tích
            </p>

            <h5>
                ${escapeHTML(
        nearestPlace.name
    )}
            </h5>

            <p>
                📍 ${escapeHTML(
        nearestPlace.address ||
        "Chưa có địa chỉ"
    )
        }
            </p>

            <p>
                📏 Cách bạn khoảng:
                ${Math.round(
            nearestPlace.distance
        )} m
            </p>

        </div>
    `;

    // =========================
    // HIỂN THỊ THÔNG TIN
    // =========================

    status.style.display = "block";

    status.innerHTML = `
    <div class="text-success">

        <p>
            ✅ Bạn đang ở gần di tích
        </p>

        <h5>
            🏛️ ${escapeHTML(nearestPlace.name)}
        </h5>

        <p>
            📏 Cách bạn khoảng:
            ${Math.round(nearestPlace.distance)} m
        </p>

        <button
            type="button"
            class="btn btn-primary"
            onclick="getPlaceInfoById(${nearestPlace.id})"
        >
            📖 Tìm hiểu di tích
        </button>

    </div>
`;

    return nearestPlace;
}


// =========================
// Lấy thông tin địa điểm
// =========================
function getPlaceInfo(place) {

    const status =
        document.getElementById(
            "locationStatus"
        );

    console.log(
        "📖 Thông tin di tích:",
        place
    );

    status.innerHTML = `

        <div>

            <div class="text-success">

                <p>
                    ✅ Đã xác định di tích
                </p>

            </div>

            <h4>
                ${escapeHTML(
        place.name
    )}
            </h4>

            <p>
                📍 ${escapeHTML(
        place.address ||
        "Chưa có địa chỉ"
    )
        }
            </p>

            <p>
                📏 Cách bạn khoảng:
                ${Math.round(
            place.distance
        )} m
            </p>

            <p>
                🏷️ Loại:
                ${escapeHTML(
            place.type ||
            "Di tích lịch sử"
        )
        }
            </p>

            <hr>

            <h5>
                📖 Thông tin
            </h5>

            <p>
                ${escapeHTML(
            place.description ||
            "Chưa có mô tả."
        )
        }
            </p>

        </div>

    `;
}

// =========================
// Xoá ảnh sau khi tắt cam
// =========================
function clearCameraData() {

    const canvas =
        document.getElementById("photo");

    const video =
        document.getElementById("camera");

    const photoContainer =
        document.getElementById("photoContainer");

    // Xóa nội dung canvas
    if (canvas) {

        const context =
            canvas.getContext("2d");

        context.clearRect(
            0,
            0,
            canvas.width,
            canvas.height
        );

        canvas.width = 0;
        canvas.height = 0;
    }

    // Tắt stream cũ
    if (video) {
        video.srcObject = null;
    }

    // Ẩn ảnh cũ
    if (photoContainer) {
        photoContainer.style.display = "none";
    }
}

// =========================
// Lấy thông tin bằng id
// =========================
function getPlaceInfoById(id) {

    const place = heritageData.find(
        place => String(place.id) === String(id)
    );

    if (!place) {
        console.error("❌ Không tìm thấy di tích:", id);
        return;
    }

    const photoContainer =
        document.getElementById("photoContainer");

    const status =
        document.getElementById("locationStatus");

    // Nếu đang có scan cũ thì hủy
    if (scanTimer) {
        clearTimeout(scanTimer);
        scanTimer = null;
    }

    // Bắt đầu scan
    photoContainer.classList.add("scanning");

    status.style.display = "none";

    // =========================
    // THỜI GIAN SCAN
    // =========================

    scanTimer = setTimeout(() => {

        scanTimer = null;

        // Dừng scan
        stopScanEffect();

        // Hiện kết quả
        status.style.display = "block";

        status.innerHTML = `
            <div class="text-center">

                <p class="text-success">
                    ✅ Đã nhận diện di tích
                </p>

                <h5>
                    🏛️ ${escapeHTML(place.name)}
                </h5>

                <button
                    type="button"
                    class="btn btn-success"
                    onclick="showHeritageInfo('${place.id}')"
                >
                    📖 Hiện thông tin di tích
                </button>

            </div>
        `;

    }, 5000);
}


// =========================
// Đưa thông tin bằng id sau scan
// =========================
function showHeritageInfo(id) {

    const place = heritageData.find(
        place => String(place.id) === String(id)
    );

    if (!place) {
        console.error(
            "❌ Không tìm thấy di tích:",
            id
        );
        return;
    }

    console.log(
        "📖 Hiển thị thông tin:",
        place
    );

    const status =
        document.getElementById("locationStatus");

    if (!status) {
        console.error(
            "❌ Không tìm thấy locationStatus"
        );
        return;
    }

    status.style.display = "block";

    status.innerHTML = `
        <div class="heritage-info">

            <h4>
                🏛️ ${escapeHTML(place.name)}
            </h4>

            <p>
                📍 ${escapeHTML(
        place.address || "Chưa có địa chỉ"
    )}
            </p>

            <hr>

            <h5>
                📖 Giới thiệu
            </h5>

            <p>
                ${escapeHTML(
        place.description || "Chưa có mô tả."
    )}
            </p>

            ${place.type
            ? `
                    <p>
                        🏷️ Loại:
                        ${escapeHTML(place.type)}
                    </p>
                    `
            : ""
        }

            ${place.images && place.images.length > 0
            ? `
                    <div class="row g-2 mt-3">

                        ${place.images.map(image => `
                            <div class="col-md-4">
                                <img
                                    src="${escapeHTML(image)}"
                                    class="img-fluid rounded"
                                    alt="${escapeHTML(place.name)}"
                                >
                            </div>
                        `).join("")}

                    </div>
                    `
            : ""
        }

        </div>
    `;
}

// =========================
// RESET
// =========================
// =========================
// RESET TOÀN BỘ CAMERA SESSION
// =========================

function resetCameraSession() {

    console.log("🔄 RESET CAMERA SESSION");

    // =========================
    // 1. HỦY TIMER SCAN
    // =========================

    if (scanTimer !== null) {

        clearTimeout(scanTimer);

        scanTimer = null;

        console.log("🛑 Đã hủy scan timer");
    }


    // =========================
    // 2. DỪNG HIỆU ỨNG SCAN
    // =========================

    const photoContainer =
        document.getElementById("photoContainer");

    if (photoContainer) {

        photoContainer.classList.remove(
            "scanning"
        );

        photoContainer.style.display = "none";
    }


    // =========================
    // 3. TẮT CAMERA
    // =========================

    stopCamera();


    // =========================
    // 4. XÓA ẢNH
    // =========================

    const canvas =
        document.getElementById("photo");

    if (canvas) {

        const context =
            canvas.getContext("2d");

        context.clearRect(
            0,
            0,
            canvas.width,
            canvas.height
        );

        canvas.width = 0;
        canvas.height = 0;
    }


    // =========================
    // 5. RESET VIDEO
    // =========================

    const video =
        document.getElementById("camera");

    if (video) {

        video.pause();

        video.srcObject = null;

        video.style.display = "block";
    }


    // =========================
    // 6. RESET NÚT CHỤP
    // =========================

    const takeButton =
        document.getElementById(
            "takePhotoButton"
        );

    const retakeButton =
        document.getElementById(
            "retakeButton"
        );

    const switchCameraButton =
        document.getElementById(
            "switchCameraButton"
        );

    if (takeButton) {

        takeButton.style.display =
            "inline-block";

        takeButton.disabled = true;
    }

    if (retakeButton) {

        retakeButton.style.display =
            "none";
    }

    if (switchCameraButton) {

        switchCameraButton.style.display =
            "inline-block";
    }
    // =========================
    // 7. XÓA GPS
    // =========================

    userLatitude = null;
    userLongitude = null;


    // =========================
    // 8. RESET TRẠNG THÁI
    // =========================

    const status =
        document.getElementById(
            "locationStatus"
        );

    if (status) {

        status.innerHTML = "";

        status.style.display = "none";
    }


    console.log(
        "✅ CAMERA SESSION ĐÃ RESET"
    );
}
// =========================
// RESET KHI ĐÓNG CAMERA MODAL
// =========================

const cameraModal =
    document.getElementById("cameraModal");

if (cameraModal) {

    cameraModal.addEventListener(
        "hidden.bs.modal",
        function () {

            console.log(
                "❌ Camera đã đóng → RESET"
            );

            resetCameraSession();

        }
    );
}

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