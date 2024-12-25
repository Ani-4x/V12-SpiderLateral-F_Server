const fileSchema = new mongoose.Schema({
    senderId: String,

    receiverId: String,

    text: String,
    
    fileUrl: String, // Path to the file

    fileType: String, // MIME type (e.g., "image/png", "application/pdf")

    timestamp: { type: Date, default: Date.now },
  });

  const FileSharing = mongoose.model('FileSharing', fileSchema);
  export default FileSharing;