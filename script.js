
let cameraStream = null;

// Lưu GPS của user
let userLatitude = null;
let userLongitude = null;

let heritageData = [];
let heritageDataLoaded = false;

const places = {

    daiNoi: {
        name: "Đại Nội Huế",

        location: "Phường Phú Hậu, Huế",

        description:
            "Đại Nội Huế là trung tâm của Kinh thành Huế và là một phần quan trọng của Quần thể Di tích Cố đô Huế.",

        images: [
            "images/dai_noi_hue/1.jpg",
            "images/dai_noi_hue/1.jpg",
            "images/dai_noi_hue/1.jpg"
        ],

        info: [
            "Triều đại: Nguyễn",
            "Thời gian: 1802 - 1945",
            "Loại hình: Di tích lịch sử"
        ]
    },


    tuDuc: {
        name: "Lăng Tự Đức",

        location: "Phường Thuỷ Xuân, Huế",

        description:
            "Lăng Tự Đức là một trong những công trình kiến trúc đẹp và nổi tiếng của triều Nguyễn.",

        images: [
            "images/lang_tu_duc/1.jpeg",
            "images/lang_tu_duc/1.jpeg",
            "images/lang_tu_duc/1.jpeg"
        ],

        info: [
            "Triều đại: Nguyễn",
            "Thời gian xây dựng: 1864 - 1867",
            "Loại hình: Lăng tẩm"
        ]
    },


    thienMu: {
        name: "Chùa Thiên Mụ",

        location: "Phường Hương Long, Huế",

        description:
            "Chùa Thiên Mụ là một trong những ngôi chùa nổi tiếng nhất ở Huế và nằm bên dòng sông Hương.",

        images: [
            "images/chua_thien_mu/1.jpeg",
            "images/chua_thien_mu/1.jpeg",
            "images/chua_thien_mu/1.jpeg"
        ],

        info: [
            "Địa điểm: Đồi Hà Khê",
            "Loại hình: Chùa",
            "Đặc điểm: Tháp Phước Duyên"
        ]
    }

};
function showPlace(placeId) {

    const place = places[placeId];

    if (!place) {
        return;
    }


    // Tên
    document.getElementById("placeModalTitle").textContent =
        place.name;

    document.getElementById("placeName").textContent =
        place.name;


    // Địa điểm
    document.getElementById("placeLocation").textContent =
        place.location;


    // Mô tả
    document.getElementById("placeDescription").textContent =
        place.description;


    // Thông tin
    const infoElement =
        document.getElementById("placeInfo");

    infoElement.innerHTML = "";

    place.info.forEach(function (item) {

        const li = document.createElement("li");

        li.textContent = item;

        infoElement.appendChild(li);

    });


    // Gallery
    const carouselImages =
        document.getElementById("carouselImages");

    carouselImages.innerHTML = "";


    place.images.forEach(function (image, index) {

        const div = document.createElement("div");

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

    });


    // Mở Modal
    const modalElement =
        document.getElementById("placeModal");

    const modal =
        new bootstrap.Modal(modalElement);

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

        cameraStream =
            await navigator.mediaDevices.getUserMedia({
                video: true,
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
// CHỤP ẢNH
// =========================

function takePhoto() {

    const video =
        document.getElementById("camera");

    const canvas =
        document.getElementById("photo");

    const context =
        canvas.getContext("2d");


    // Lấy kích thước camera
    canvas.width =
        video.videoWidth;

    canvas.height =
        video.videoHeight;


    // Chụp ảnh từ camera vào Canvas
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
    canvas.style.display = "block";


    // Ẩn nút chụp
    document.getElementById("takePhotoButton")
        .style.display = "none";


    // Hiện nút chụp lại
    document.getElementById("retakeButton")
        .style.display = "inline-block";


    // Tắt camera
    stopCamera();


    // =========================
    // KIỂM TRA GPS
    // =========================

    if (
        userLatitude !== null &&
        userLongitude !== null
    ) {

        console.log("GPS đã sẵn sàng");

        findNearestHeritage(
            userLatitude,
            userLongitude
        );

    }
}


// =========================
// TẮT CAMERA
// =========================

function stopCamera() {

    if (cameraStream) {

        cameraStream
            .getTracks()
            .forEach(function (track) {

                track.stop();

            });

        cameraStream = null;
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

    const canvas =
        document.getElementById("photo");


    // Hiện camera
    video.style.display = "block";


    // Ẩn ảnh
    canvas.style.display = "none";


    // Hiện nút chụp
    document.getElementById("takePhotoButton")
        .style.display = "inline-block";


    // Ẩn nút chụp lại
    document.getElementById("retakeButton")
        .style.display = "none";


    // Giữ trạng thái GPS
    const status =
        document.getElementById("locationStatus");


    if (
        userLatitude !== null &&
        userLongitude !== null
    ) {

        status.style.display = "block";

        status.innerHTML = `
        < p class="text-success" >
                ✅ Vị trí đã sẵn sàng
            </p >
        `;

    } else {

        status.style.display = "block";

        status.innerHTML = `
        < p class="text-primary" >
                📍 Đang xác định vị trí...
            </p >
        `;

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

    const MAX_DISTANCE = 200;

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

    getPlaceInfo(
        nearestPlace
    );

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