const express = require("express");
const { body, validationResult } = require("express-validator");
const Note = require("../models/Note");
const fetchUser = require("../middlewares/fetchUser");

const router = express.Router();

// Get all notes using GET /api/notes
router.get("/", fetchUser, async (req, res) => {
    const notes = await Note.find({ user: req.user.id });
    res.json(notes);
});

// Create a new note using POST /api/notes
router.post(
    "/",
    [body("content", "Note content must not be empty.").isLength({ min: 1 })],
    fetchUser,
    async (req, res) => {
        // Getting the request validation result and returning errors if any
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res
                .status(400)
                .json({ success: false, errors: errors.array() });
        }
        try {
            let { title, content, tag } = req.body;

            // Setting default value for the field tag
            tag = tag || "General";

            const note = await Note.create({
                user: req.user.id,
                title: title,
                content: content,
                tag: tag,
            });

            res.json({ success: true, note });
        } catch (e) {
            return res.status(400).json({
                success: false,
                error: {
                    code: e.code,
                    name: e.name,
                    message: e.message,
                },
            });
        }
    }
);

// Update an existing note using PATCH /api/notes/:id
/*
    Request body must contain an array of objects containing fields to update with their values
    Example array: 
    [{field: "title", value: "new title"}]
*/
router.patch(
    "/:id",
    [
        body("fields", "Please provide atleast one field to update.").isLength({
            min: 1,
        }),
    ],
    fetchUser,
    async (req, res) => {
        // Getting the request validation result and returning errors if any
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res
                .status(400)
                .json({ success: false, errors: errors.array() });
        }

        try {
            const { fields } = req.body;

            const noteID = req.params.id;
            const note = await Note.findOne({ _id: noteID, user: req.user.id });

            if (!note) {
                return res.status(400).json({
                    success: false,
                    error: {
                        message: "Invalid note ID. Please try again.",
                    },
                });
            }

            // Checking if content field is empty
            const content = fields.find(
                (element) => element.field === "content"
            );
            if (content) {
                if (!content.value) {
                    return res.status(400).json({
                        success: false,
                        error: {
                            message: "Note content must not be empty.",
                        },
                    });
                }
            }

            // Loop through fields array to update provided fields
            fields.forEach((element) => {
                note[element.field] = element.value;
            });

            // Update updatedAt field
            note.updatedAt = Date.now();

            await note.save();

            res.json({ success: true, note });
        } catch (e) {
            return res.status(400).json({
                success: false,
                error: {
                    code: e.code,
                    name: e.name,
                    message: e.message,
                },
            });
        }
    }
);

router.delete("/:id", fetchUser, async (req, res) => {
    try {
        const noteID = req.params.id;
        const note = await Note.findOne({ _id: noteID, user: req.user.id });

        if (!note) {
            return res.status(400).json({
                success: false,
                error: {
                    message: "Invalid note ID. Please try again.",
                },
            });
        }

        await note.deleteOne();

        res.json({ success: true, note });
    } catch (e) {
        return res.status(400).json({
            success: false,
            error: {
                code: e.code,
                name: e.name,
                message: e.message,
            },
        });
    }
});

module.exports = router;
