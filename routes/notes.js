const express = require("express");
const { body, validationResult } = require("express-validator");
const Note = require("../models/Note");
const fetchUser = require("../middlewares/fetchUser");
const checkUser = require("../middlewares/checkUser");

const router = express.Router();

// Get all notes using GET /api/notes
router.get("/", fetchUser, checkUser, async (req, res) => {
    const notes = await Note.find({ user: req.user.id });
    res.status(200).json({
        success: true,
        data: {
            notes,
        },
    });
});

// Create a new note using POST /api/notes
router.post(
    "/",
    [body("content").notEmpty().withMessage("Note content must not be empty.")],
    fetchUser,
    checkUser,
    async (req, res) => {
        // Getting the request validation result and returning errors if any
        const errors = validationResult(req)
            .array()
            .map((error) => ({
                name: "ValidationError",
                type: error.type,
                message: error.msg,
                field: error.path,
                location: error.location,
            }));

        if (errors.length !== 0) {
            return res.status(400).json({ success: false, errors: errors });
        }

        let { title, content, tag } = req.body;

        // Setting default value for the field tag
        tag = tag || "General";

        try {
            const note = await Note.create({
                user: req.user.id,
                title: title,
                content: content,
                tag: tag,
            });

            res.status(201).json({
                success: true,
                data: {
                    note,
                },
            });
        } catch (e) {
            return res.status(500).json({
                success: false,
                error: {
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

// Todo: use spread operator instead of this
router.patch(
    "/:id",
    [
        body("fields", "Please provide atleast one field to update.").isLength({
            min: 1,
        }),
    ],
    fetchUser,
    checkUser,
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

router.delete("/:id", fetchUser, checkUser, async (req, res) => {
    try {
        const noteID = req.params.id;

        const note = await Note.findOne({ _id: noteID, user: req.user.id });

        if (!note) {
            return res.status(400).json({
                success: false,
                errors: [
                    {
                        name: "ReferenceError",
                        message: "Invalid note ID.",
                    },
                ],
            });
        }

        await note.deleteOne();

        res.json({
            success: true,
            data: {
                note,
            },
        });
    } catch (e) {
        return res.status(500).json({
            success: false,
            errors: [
                {
                    name: e.name,
                    message: e.message,
                },
            ],
        });
    }
});

module.exports = router;
