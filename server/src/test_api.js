async function test() {
    try {
        const res = await fetch('http://localhost:8080/api/incident_types');
        console.log("Status:", res.status);
        const json = await res.json();
        console.log("KẾT QUẢ API incident_types:", json);
    } catch (err) {
        console.error("LỖI API:", err);
    }
}

test();
