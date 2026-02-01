import multer from "multer";


/**
 * Multer config
 * Voice input must be audio
 */
export const upload = multer({
    dest: "tmp/",
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB max
    },
});