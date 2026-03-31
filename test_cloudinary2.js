const url = "https://res.cloudinary.com/dtavy8ear/image/upload/v1774338144/upload_1774338143774.pdf.jpg";
fetch(url).then(res => {
    console.log("Status:", res.status);
    console.log("Content-Type:", res.headers.get("content-type"));
}).catch(err => console.error(err));
