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

        findPlace(
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
// TÌM ĐỊA ĐIỂM BẰNG OPENSTREETMAP
// =========================

async function findPlace(latitude, longitude) {

    const status =
        document.getElementById("locationStatus");

    status.innerHTML = `
        <p class="text-primary">
            🔍 Đang xác định địa điểm...
        </p>
    `;

    try {

        const url =
            `https://nominatim.openstreetmap.org/reverse` +
            `?lat=${encodeURIComponent(latitude)}` +
            `&lon=${encodeURIComponent(longitude)}` +
            `&format=jsonv2` +
            `&addressdetails=1` +
            `&namedetails=1` +
            `&zoom=18`;

        console.log("🌐 OpenStreetMap URL:", url);

        const response = await fetch(url, {
            method: "GET",
            headers: {
                "Accept": "application/json"
            }
        });

        if (!response.ok) {
            throw new Error(
                `HTTP ${response.status}`
            );
        }

        const data = await response.json();

        console.log(
            "🗺️ OpenStreetMap Response:",
            data
        );

        // =========================
        // KIỂM TRA KẾT QUẢ
        // =========================

        if (!data || !data.display_name) {

            status.innerHTML = `
                <p class="text-warning">
                    ⚠️ Không tìm thấy địa điểm gần bạn.
                </p>
            `;

            return;
        }

        // =========================
        // LẤY TÊN ĐỊA ĐIỂM
        // =========================

        const address = data.address || {};

        const placeName =
            data.name ||
            address.historic ||
            address.tourism ||
            address.amenity ||
            address.building ||
            address.attraction ||
            address.monument ||
            address.place ||
            "Địa điểm chưa xác định";

        // =========================
        // TẠO OBJECT PLACE
        // =========================

        const place = {

            name: placeName,

            displayName: placeName,

            displayNameText: placeName,

            formattedAddress:
                data.display_name,

            latitude:
                Number(data.lat),

            longitude:
                Number(data.lon),

            type:
                data.type || "",

            category:
                data.category || "",

            address:
                address,

            osmId:
                data.osm_id,

            osmType:
                data.osm_type,

            osmUrl:
                data.osm_id
                    ? `https://www.openstreetmap.org/${data.osm_type}/${data.osm_id}`
                    : null
        };

        // =========================
        // DEBUG
        // =========================

        console.log(
            "🏯 Địa điểm:",
            place.name
        );

        console.log(
            "📍 Địa chỉ:",
            place.formattedAddress
        );

        console.log(
            "🌐 Latitude:",
            place.latitude
        );

        console.log(
            "🌐 Longitude:",
            place.longitude
        );

        console.log(
            "🆔 OSM ID:",
            place.osmId
        );

        // =========================
        // HIỂN THỊ
        // =========================

        status.innerHTML = `

            <div class="text-success">

                <p>
                    ✅ Đã xác định địa điểm
                </p>

                <h5>
                    ${place.name}
                </h5>

                <p>
                    📍 ${place.formattedAddress}
                </p>

            </div>

        `;

        // =========================
        // BƯỚC TIẾP THEO
        // =========================

        processWithAI(place);

    }

    catch (error) {

        console.error(
            "❌ OpenStreetMap Error:",
            error
        );

        status.innerHTML = `

            <div class="text-danger">

                <p>
                    ❌ Không thể xác định địa điểm.
                </p>

                <small>
                    ${error.message}
                </small>

            </div>

        `;
    }
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

// =========================
// XỬ LÝ THÔNG TIN ĐỊA ĐIỂM
// =========================

function processWithAI(place) {

    console.log(
        "🤖 Chuẩn bị xử lý thông tin..."
    );

    console.log(
        "Địa điểm:",
        place.name
    );

    console.log(
        "Địa chỉ:",
        place.formattedAddress
    );

    console.log(
        "Latitude:",
        place.latitude
    );

    console.log(
        "Longitude:",
        place.longitude
    );

    const status =
        document.getElementById("locationStatus");

    status.innerHTML = `

        <div class="text-success">

            <p>
                ✅ Đã xác định địa điểm
            </p>

            <h4>
                ${place.name}
            </h4>

            <p>
                📍 ${place.formattedAddress}
            </p>

            <hr>

            <p>
                🤖 AI sẽ tạo nội dung giới thiệu
                ở bước tiếp theo.
            </p>

        </div>

    `;
}