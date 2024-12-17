const ImgUpload = async (req, res) => {
  try {
    const imagePath = req.file.path;

    return res.status(200).json({
      success: true,
      message: "Image uploaded successfully!",
      imagePath: imagePath,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Error uploading image", error: error.message });
  }
};

module.exports = { ImgUpload };
