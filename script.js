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
// TÌM DI TÍCH BẰNG GPS
// OPENSTREETMAP + OVERPASS
// =========================

async function findPlace(latitude, longitude) {

    const status =
        document.getElementById("locationStatus");

    status.innerHTML = `
        <p class="text-primary">
            🔍 Đang tìm di tích gần bạn...
        </p>
    `;

    // Ép GPS thành Number
    latitude = Number(latitude);
    longitude = Number(longitude);

    console.log("📍 GPS:");
    console.log("Latitude:", latitude);
    console.log("Longitude:", longitude);

    // Kiểm tra GPS
    if (
        !Number.isFinite(latitude) ||
        !Number.isFinite(longitude)
    ) {

        console.error(
            "❌ GPS không hợp lệ"
        );

        status.innerHTML = `
            <p class="text-danger">
                ❌ GPS không hợp lệ.
            </p>
        `;

        return;
    }

    // ==================================
    // BÁN KÍNH
    // ==================================

    const radius = 100;

    // ==================================
    // QUERY Main
    // ==================================

    // const query = `
    //     [out:json][timeout:8];

    //     (
    //         nwr(
    //             around:${radius},${latitude},${longitude}
    //         )["heritage"];

    //         nwr(
    //             around:${radius},${latitude},${longitude}
    //         )["historic"~"monument|castle|palace|temple|church|archaeological_site"];

    //         nwr(
    //             around:${radius},${latitude},${longitude}
    //         )["tourism"="attraction"]["name"];

    //         nwr(
    //             around:${radius},${latitude},${longitude}
    //         )["monument"]["name"];
    //     );

    //     out center tags;
    // `;

    // ==================================
    // QUERY test
    // ==================================
    const query = `
    [out:json][timeout:10];

    nwr(
        around:${radius},${latitude},${longitude}
    )["amenity"="restaurant"];

    out center tags;
`;

    // ==================================
    // DANH SÁCH SERVER
    // ==================================

    const servers = [

        "https://overpass-api.de/api/interpreter",

        "https://overpass.private.coffee/api/interpreter"

    ];

    let lastError = null;

    // ==================================
    // THỬ TỪNG SERVER
    // ==================================

    for (const server of servers) {

        try {

            console.log(
                "🌐 Đang thử:",
                server
            );

            const controller =
                new AbortController();

            // Timeout 12 giây
            const timeout =
                setTimeout(
                    () => controller.abort(),
                    12000
                );

            const response =
                await fetch(
                    server,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/x-www-form-urlencoded;charset=UTF-8"
                        },

                        body:
                            "data=" +
                            encodeURIComponent(query),

                        signal:
                            controller.signal
                    }
                );

            clearTimeout(timeout);

            console.log(
                "HTTP:",
                response.status
            );

            if (!response.ok) {

                throw new Error(
                    `HTTP ${response.status}`
                );
            }

            const data =
                await response.json();

            console.log(
                "🗺️ Overpass response:",
                data
            );

            // ==================================
            // KHÔNG CÓ KẾT QUẢ
            // ==================================

            if (
                !data.elements ||
                data.elements.length === 0
            ) {

                status.innerHTML = `
                    <div class="text-warning">

                        <p>
                            ⚠️ Không tìm thấy
                            di tích gần bạn.
                        </p>

                        <small>
                            Hãy thử đứng gần
                            di tích hơn.
                        </small>

                    </div>
                `;

                return;
            }

            // ==================================
            // XỬ LÝ PLACE
            // ==================================

            const places = [];

            for (
                const element
                of data.elements
            ) {

                const tags =
                    element.tags || {};

                // --------------------------
                // TỌA ĐỘ
                // --------------------------

                let placeLat = null;
                let placeLon = null;

                // Node
                if (
                    element.lat !== undefined &&
                    element.lon !== undefined
                ) {

                    placeLat =
                        Number(element.lat);

                    placeLon =
                        Number(element.lon);
                }

                // Way / Relation
                else if (
                    element.center
                ) {

                    placeLat =
                        Number(
                            element.center.lat
                        );

                    placeLon =
                        Number(
                            element.center.lon
                        );
                }

                // Kiểm tra
                if (
                    !Number.isFinite(placeLat) ||
                    !Number.isFinite(placeLon)
                ) {

                    continue;
                }

                // --------------------------
                // TÊN
                // --------------------------

                let name = null;

                if (
                    typeof tags["name:vi"]
                    === "string"
                ) {

                    name =
                        tags["name:vi"];

                } else if (
                    typeof tags.name
                    === "string"
                ) {

                    name =
                        tags.name;

                } else if (
                    typeof tags["name:en"]
                    === "string"
                ) {

                    name =
                        tags["name:en"];
                }

                // Không có tên
                if (!name) {
                    continue;
                }

                // --------------------------
                // ĐỊA CHỈ
                // --------------------------

                let address = "";

                if (
                    typeof tags["addr:full"]
                    === "string"
                ) {

                    address =
                        tags["addr:full"];

                } else if (
                    typeof tags["addr:street"]
                    === "string"
                ) {

                    address =
                        tags["addr:street"];
                }

                // --------------------------
                // TẠO PLACE
                // --------------------------

                const place = {

                    id:
                        element.id,

                    osmType:
                        element.type,

                    name:
                        name,

                    address:
                        address,

                    historic:
                        typeof tags.historic ===
                            "string"
                            ? tags.historic
                            : "",

                    tourism:
                        typeof tags.tourism ===
                            "string"
                            ? tags.tourism
                            : "",

                    heritage:
                        typeof tags.heritage ===
                            "string"
                            ? tags.heritage
                            : "",

                    description:
                        typeof tags.description ===
                            "string"
                            ? tags.description
                            : "",

                    website:
                        typeof tags.website ===
                            "string"
                            ? tags.website
                            : "",

                    latitude:
                        placeLat,

                    longitude:
                        placeLon,

                    tags:
                        tags
                };

                // --------------------------
                // TÍNH KHOẢNG CÁCH
                // --------------------------

                place.distance =
                    calculateDistance(
                        latitude,
                        longitude,
                        placeLat,
                        placeLon
                    );

                // --------------------------
                // CHECK DISTANCE
                // --------------------------

                if (
                    !Number.isFinite(
                        place.distance
                    )
                ) {

                    continue;
                }

                places.push(place);
            }

            // ==================================
            // KHÔNG CÓ PLACE HỢP LỆ
            // ==================================

            if (
                places.length === 0
            ) {

                status.innerHTML = `
                    <p class="text-warning">
                        ⚠️ Không tìm thấy
                        địa điểm hợp lệ.
                    </p>
                `;

                return;
            }

            // ==================================
            // TÍNH ĐIỂM ƯU TIÊN
            // ==================================

            places.forEach(
                place => {

                    let score = 0;

                    // Di sản
                    if (
                        place.heritage
                    ) {
                        score += 100;
                    }

                    // Historic
                    if (
                        place.historic
                    ) {
                        score += 80;
                    }

                    // Monument
                    if (
                        place.historic ===
                        "monument"
                    ) {
                        score += 50;
                    }

                    // Attraction
                    if (
                        place.tourism ===
                        "attraction"
                    ) {
                        score += 20;
                    }

                    // Gần hơn được cộng điểm
                    score +=
                        Math.max(
                            0,
                            100 -
                            place.distance
                        );

                    place.score =
                        score;
                }
            );

            // ==================================
            // SẮP XẾP
            // ==================================

            places.sort(
                (a, b) =>
                    b.score - a.score
            );

            console.log(
                "🏛️ Các địa điểm:",
                places
            );

            // ==================================
            // CHỌN
            // ==================================

            const place =
                places[0];

            console.log(
                "🏯 ĐỊA ĐIỂM ĐƯỢC CHỌN:",
                place.name
            );

            console.log(
                "📏 KHOẢNG CÁCH:",
                Math.round(
                    place.distance
                ),
                "m"
            );

            // ==================================
            // HIỂN THỊ
            // ==================================

            status.innerHTML = `

                <div class="text-success">

                    <p>
                        ✅ Đã xác định địa điểm
                    </p>

                    <h5>
                        ${escapeHTML(
                place.name
            )}
                    </h5>

                    ${place.address
                    ? `
                            <p>
                                📍 ${escapeHTML(
                        place.address
                    )
                    }
                            </p>
                        `
                    : ""
                }

                    <p>
                        📏 Cách bạn khoảng:
                        ${Math.round(
                    place.distance
                )} m
                    </p>

                </div>

            `;

            // ==================================
            // XỬ LÝ THÔNG TIN
            // ==================================

            await getHeritageInfo(place);

            return;

        }

        catch (error) {

            lastError =
                error;

            console.warn(
                "⚠️ Server lỗi:",
                server,
                error
            );

            // Thử server tiếp theo
            continue;
        }
    }

    // ==================================
    // TẤT CẢ SERVER ĐỀU LỖI
    // ==================================

    console.error(
        "❌ Tất cả Overpass server đều lỗi:",
        lastError
    );

    status.innerHTML = `

        <div class="text-danger">

            <p>
                ❌ Không thể kết nối
                đến OpenStreetMap.
            </p>

            <small>
                Máy chủ bản đồ đang bận.
                Vui lòng thử lại sau vài giây.
            </small>

        </div>

    `;
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
// LẤY THÔNG TIN DI TÍCH
// =========================

async function getHeritageInfo(place) {

    const status =
        document.getElementById("locationStatus");

    status.innerHTML = `
        <p class="text-primary">
            📖 Đang lấy thông tin di tích...
        </p>
    `;

    console.log(
        "🏛️ Đang lấy thông tin:",
        place.name
    );

    try {

        // =========================
        // LẤY THÔNG TIN TỪ OSM
        // =========================

        const information = {

            name:
                place.name ||
                "Chưa có tên",

            description:
                place.description ||
                "Chưa có mô tả.",

            type:
                place.historic ||
                place.tourism ||
                "Di tích",

            heritage:
                place.heritage ||
                "",

            address:
                place.address ||
                "Chưa có địa chỉ",

            latitude:
                place.latitude,

            longitude:
                place.longitude,

            website:
                place.website ||
                "",

            distance:
                place.distance
        };

        console.log(
            "📖 Thông tin di tích:",
            information
        );

        // =========================
        // HIỂN THỊ
        // =========================

        status.innerHTML = `

            <div class="heritage-info">

                <div class="text-success">

                    <p>
                        ✅ Đã xác định di tích
                    </p>

                </div>

                <h4>
                    ${escapeHTML(
            information.name
        )}
                </h4>

                <p>
                    📍 ${escapeHTML(
            information.address
        )
            }
                </p>

                <p>
                    📏 Cách bạn khoảng:
                    ${Math.round(
                information.distance
            )
            } m
                </p>

                <hr>

                <h5>
                    🏛️ Thông tin di tích
                </h5>

                <p>
                    ${escapeHTML(
                information.description
            )
            }
                </p>

                ${information.heritage
                ? `
                        <p>
                            🏛️ Cấp di sản:
                            ${escapeHTML(
                    information.heritage
                )
                }
                        </p>
                    `
                : ""
            }

                ${information.website
                ? `
                        <p>
                            🌐
                            <a
                                href="${escapeHTML(
                    information.website
                )}"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                Website
                            </a>
                        </p>
                    `
                : ""
            }

            </div>

        `;

        return information;

    }

    catch (error) {

        console.error(
            "❌ Lỗi lấy thông tin di tích:",
            error
        );

        status.innerHTML = `
            <div class="text-danger">

                <p>
                    ❌ Không thể lấy thông tin
                    di tích.
                </p>

            </div>
        `;

        return null;
    }
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