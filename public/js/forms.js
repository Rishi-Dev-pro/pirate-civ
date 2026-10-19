/**
 * PIRATE-CIV FORM & CUSTOM FILE UPLOADER ENGINE
 * Provides accessible, keyboard-friendly custom file inputs,
 * live preview updates, drag-and-drop, and unified form interaction.
 */
(function () {
    "use strict";

    function formatBytes(bytes) {
        if (!bytes || bytes === 0) return "0 B";
        var k = 1024;
        var sizes = ["B", "KB", "MB"];
        var i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
    }

    function initFileUploader(container) {
        if (container._pirateUploaderInit) return;
        container._pirateUploaderInit = true;

        var input = container.querySelector(".pirate-file-input, input[type='file']");
        var shell = container.querySelector(".pirate-file-shell, label[for]");
        var chosenLabel = container.querySelector(".pirate-file-chosen");
        if (!input || !shell) return;

        var initialText = chosenLabel ? chosenLabel.textContent : "No image selected";

        // Keyboard trigger on shell
        shell.addEventListener("keydown", function (e) {
            if (e.key === "Enter" || e.key === " " || e.key === "Spacebar") {
                e.preventDefault();
                input.click();
            }
        });

        // Change event
        input.addEventListener("change", function () {
            if (input.files && input.files.length > 0) {
                var file = input.files[0];
                if (chosenLabel) {
                    chosenLabel.textContent = "⚓ " + file.name + " (" + formatBytes(file.size) + ")";
                    chosenLabel.title = file.name;
                }
                shell.classList.add("is-selected");

                // Check for live preview targets
                var targetId = container.getAttribute("data-preview-target");
                var previewImg = null;
                if (targetId) {
                    previewImg = document.getElementById(targetId);
                }
                if (!previewImg) {
                    previewImg = document.getElementById("avatarPreviewImg") ||
                                 document.getElementById("buyerAvatarPreview") ||
                                 document.getElementById("productImagePreview");
                }

                if (previewImg && file.type && file.type.indexOf("image/") === 0) {
                    var reader = new FileReader();
                    reader.onload = function (e) {
                        previewImg.src = e.target.result;
                    };
                    reader.readAsDataURL(file);
                }
            } else {
                if (chosenLabel) {
                    chosenLabel.textContent = initialText;
                    chosenLabel.title = "";
                }
                shell.classList.remove("is-selected");
            }
        });

        // Drag and drop support
        ["dragenter", "dragover"].forEach(function (eventName) {
            shell.addEventListener(eventName, function (e) {
                e.preventDefault();
                e.stopPropagation();
                shell.classList.add("is-dragover");
            }, false);
        });

        ["dragleave", "drop"].forEach(function (eventName) {
            shell.addEventListener(eventName, function (e) {
                e.preventDefault();
                e.stopPropagation();
                shell.classList.remove("is-dragover");
            }, false);
        });

        shell.addEventListener("drop", function (e) {
            var dt = e.dataTransfer;
            if (dt && dt.files && dt.files.length > 0) {
                try {
                    input.files = dt.files;
                    var evt = new Event("change", { bubbles: true });
                    input.dispatchEvent(evt);
                } catch (err) {
                    // Browser might prevent setting input.files directly in some environments
                }
            }
        });
    }

    function initAllForms() {
        var uploaders = document.querySelectorAll(".pirate-file-uploader");
        uploaders.forEach(initFileUploader);

        // Fallback for any standalone custom checkboxes to ensure aria-checked
        var customCheckboxes = document.querySelectorAll(".pirate-checkbox-input");
        customCheckboxes.forEach(function (chk) {
            chk.addEventListener("change", function () {
                var parent = chk.closest(".pirate-checkbox-label");
                if (parent) {
                    if (chk.checked) {
                        parent.classList.add("is-checked");
                    } else {
                        parent.classList.remove("is-checked");
                    }
                }
            });
        });

        // Reset default seal handling
        var resetCheckbox = document.querySelector("input[name='removeAvatar']");
        if (resetCheckbox) {
            resetCheckbox.addEventListener("change", function () {
                var previewImg = document.getElementById("avatarPreviewImg") || document.getElementById("buyerAvatarPreview");
                var chosenLabel = document.querySelector("[data-uploader='avatar'] .pirate-file-chosen, [data-uploader='buyerAvatar'] .pirate-file-chosen");
                var shell = document.querySelector("[data-uploader='avatar'] .pirate-file-shell, [data-uploader='buyerAvatar'] .pirate-file-shell");
                if (resetCheckbox.checked) {
                    if (previewImg) {
                        previewImg.src = "/images/avatars/default-pirate.png";
                    }
                    if (chosenLabel) {
                        chosenLabel.textContent = "Default Admiralty Seal will be restored upon saving";
                    }
                    if (shell) {
                        shell.classList.remove("is-selected");
                    }
                }
            });
        }
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initAllForms);
    } else {
        initAllForms();
    }

    // Expose for dynamic rendering if needed
    window.PirateCivForms = {
        init: initAllForms,
        initUploader: initFileUploader
    };
})();
