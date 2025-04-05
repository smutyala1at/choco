const express = require("express");
const app = express();
const port = process.env.PORT || 3000;
const cors = require("cors");

app.use(cors());

app.get("/", (req, res) => {
    res.status(200).json({
        message: "Hello World"
    })
});

app.listen(port, ()=> {
    console.log(`Server is running on port ${port}`);
});