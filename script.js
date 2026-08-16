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

let cameraStream = null;

// Lưu GPS của user
let userLatitude = null;
let userLongitude = null;


// =========================
// MỞ CAMERA
// =========================

async function openCamera() {

    const modalElement =
        document.getElementById("cameraModal");

    const modal =
        new bootstrap.Modal(modalElement);

    modal.show();


    // Mở camera
    startCamera();

    // Xin GPS ngay khi mở camera
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

        console.log(
            "GPS đã sẵn sàng:"
        );

        console.log(
            "Latitude:",
            userLatitude
        );

        console.log(
            "Longitude:",
            userLongitude
        );


        // Dùng GPS để tìm địa điểm
        findPlace(
            userLatitude,
            userLongitude
        );

    } else {

        console.log(
            "GPS chưa lấy được."
        );


        const status =
            document.getElementById("locationStatus");


        status.innerHTML = `
            <p class="text-warning">
                ⏳ Đang chờ vị trí...
            </p>
        `;


        // Thử lấy GPS lại
        getUserLocation();
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


    // Hiển thị trạng thái
    status.style.display = "block";

    status.innerHTML = `
        <p class="text-primary">
            📍 Đang xác định vị trí...
        </p>
    `;


    // Kiểm tra trình duyệt
    if (!navigator.geolocation) {

        status.innerHTML = `
            <p class="text-danger">
                ❌ Thiết bị không hỗ trợ GPS.
            </p>
        `;

        return;
    }


    navigator.geolocation.getCurrentPosition(

        function (position) {

            // Lưu GPS vào biến
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


            // Hiển thị trạng thái thành công
            status.innerHTML = `
                <p class="text-success">
                    ✅ Đã xác định vị trí
                </p>
            `;


            // Không gọi findPlace() ở đây
            // vì user chưa chụp ảnh
        },


        function (error) {

            console.error(error);


            status.innerHTML = `
                <p class="text-danger">
                    ❌ Không thể lấy vị trí.
                </p>

                <small>
                    Hãy cho phép trình duyệt sử dụng vị trí.
                </small>
            `;

        },


        {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
        }

    );
}


// =========================
// TÌM ĐỊA ĐIỂM
// =========================

function findPlace(latitude, longitude) {

    console.log(
        "🔍 Đang tìm địa điểm..."
    );


    console.log(
        "Latitude:",
        latitude
    );


    console.log(
        "Longitude:",
        longitude
    );

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
            <p class="text-success">
                ✅ Vị trí đã sẵn sàng
            </p>
        `;

    } else {

        status.style.display = "block";

        status.innerHTML = `
            <p class="text-primary">
                📍 Đang xác định vị trí...
            </p>
        `;

        getUserLocation();
    }


    // Mở lại camera
    startCamera();
}