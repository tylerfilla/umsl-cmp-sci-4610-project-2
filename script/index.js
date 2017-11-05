/*
 * Tyler Filla
 * CS 4610
 * Project 2
 */

//
// Keyword Input Handling
//

/**
 * Functionality for a keyword input control.
 *
 * @constructor
 * @param {HTMLElement} elInputArea The input area
 * @param {HTMLElement} elChipArea The chip area
 * @param {HTMLInputElement} elInputBox The input box
 * @param {String} placeholderText Placeholder text for input box
 */
function KeywordInput(elInputArea, elChipArea, elInputBox, placeholderText) {
    this._elInputArea = elInputArea;
    this._elChipArea = elChipArea;
    this._elInputBox = elInputBox;
    this._placeholderText = placeholderText;
    this._keywords = [];

    // Bound DOM event handlers
    this._elInputBoxKeyDownBind = this._onInputBoxKeyDown.bind(this);
    this._elInputBoxBlurBind = this._onInputBoxBlur.bind(this);
    this._elInputAreaClickBind = this._onInputAreaClick.bind(this);

    // Custom event handlers
    this._onKeywordAdd = [];
    this._onKeywordRemove = [];

    // Further initialization
    this._initialize();
}

/**
 * Instance initializer.
 * @private
 */
KeywordInput.prototype._initialize = function() {
    // Listen for input box key down events
    this._elInputBox.addEventListener("keydown", this._elInputBoxKeyDownBind, true);

    // Listen for input box blur events
    this._elInputBox.addEventListener("blur", this._elInputBoxBlurBind, false);

    // Listen for input area click events
    this._elInputArea.addEventListener("click", this._elInputAreaClickBind, false);

    // Preliminary render
    this.render();
};

/**
 * Dispose of the keyword input control instance.
 */
KeywordInput.prototype.dispose = function() {
    // Remove all keyword listeners
    this.removeAllListeners();

    // Unlisten for input box key down events
    this._elInputBox.removeEventListener("keydown", this._elInputBoxKeyDownBind, true);

    // Unlisten for input box blur events
    this._elInputBox.removeEventListener("blur", this._elInputBoxBlurBind, false);

    // Unlisten for input area click events
    this._elInputArea.removeEventListener("click", this._elInputAreaClickBind, false);
};

/**
 * Event handler. Called when a key goes down on the input box.
 * @private
 */
KeywordInput.prototype._onInputBoxKeyDown = function(event) {
    // If user is pressing the comma key or enter key
    if (event.key === "," || event.keyCode === 13) {
        // If the input box is not empty
        if (this._elInputBox.value !== "") {
            // Get all typed text...
            var keyword = this._elInputBox.value;
            this._elInputBox.value = "";

            // And add it as a new keyword
            this.addKeyword(keyword);

            // Re-render search chips
            this.render();
        }

        event.preventDefault();
        return;
    }

    // If user is pressing the backspace key
    if (event.keyCode === 8) {
        // If the input box is empty
        if (this._elInputBox.value === "") {
            // Remove the last keyword
            this._keywords.pop();

            // Re-render search chips
            this.render();

            return;
        }
    }

    // If user is pressing the space key
    if (event.key === " ") {
        // If the input box is empty
        if (this._elInputBox.value === "") {
            // Block the space
            event.preventDefault();
        }
    }
};

/**
 * Event handler. Called when focus is lost from the input box.
 * @private
 */
KeywordInput.prototype._onInputBoxBlur = function(event) {
    // If the input box is not empty
    if (this._elInputBox.value !== "") {
        // Get all typed text...
        var keyword = this._elInputBox.value;
        this._elInputBox.value = "";

        // And add it as a new keyword
        this.addKeyword(keyword);

        // Re-render search chips
        this.render();
    }
};

/**
 * Event handler. Called when the input area is clicked.
 * @private
 */
KeywordInput.prototype._onInputAreaClick = function(event) {
    this.focusInputBox();
};

/**
 * Add a keyword.
 *
 * @param {String} keyword The keyword
 */
KeywordInput.prototype.addKeyword = function(keyword) {
    this._keywords.push(keyword);

    // Call listeners
    for (var i = 0; i < this._onKeywordAdd.length; ++i) {
        this._onKeywordAdd[i](keyword);
    }

    // Re-render the control
    this.render();
};

/**
 * Remove a keyword.
 *
 * @param {String} keyword The keyword
 */
KeywordInput.prototype.removeKeyword = function(keyword) {
    this.removeKeywordIdx(this._keywords.indexOf(keyword));
};

/**
 * Remove a keyword by index.
 *
 * @param {Number} keywordIdx The keyword index
 */
KeywordInput.prototype.removeKeywordIdx = function(keywordIdx) {
    var keyword = this._keywords[keywordIdx];
    this._keywords.splice(keywordIdx, 1);

    // Call listeners
    for (var i = 0; i < this._onKeywordRemove.length; ++i) {
        this._onKeywordRemove[i](keyword);
    }

    // Re-render the control
    this.render();
};

/**
 * Get all keywords.
 *
 * @returns {Array} The keyword array
 */
KeywordInput.prototype.getKeywords = function() {
    return this._keywords;
};

/**
 * Add a listener for keyword add events.
 *
 * @param callback The listener callback function
 */
KeywordInput.prototype.addOnKeywordAddListener = function(callback) {
    this._onKeywordAdd.push(callback);
};

/**
 * Add a listener for keyword remove events.
 *
 * @param callback The listener callback function
 */
KeywordInput.prototype.addOnKeywordRemoveListener = function(callback) {
    this._onKeywordRemove.push(callback);
};

/**
 * Remove all registered event listeners.
 */
KeywordInput.prototype.removeAllListeners = function() {
    this._onKeywordAdd = [];
    this._onKeywordRemove = [];
};

/**
 * Focus the input box.
 */
KeywordInput.prototype.focusInputBox = function() {
    this._elInputBox.focus();
};

/**
 * Render the keyword input control.
 */
KeywordInput.prototype.render = function() {
    // Delete all existing keyword chips
    while (this._elChipArea.firstChild) {
        this._elChipArea.removeChild(this._elChipArea.firstChild);
    }

    // Create new chips for search keywords
    for (var i = 0; i < this._keywords.length; ++i) {
        const keyword = this._keywords[i];
        const keywordIdx = i;

        // Chip root element
        var chip = document.createElement("span");
        chip.classList.add("chip");
        chip.innerText = keyword;

        // Chip keyword delete button
        var chipDel = document.createElement("button");
        chipDel.classList.add("chip-del");
        chipDel.innerText = "x";
        chip.appendChild(chipDel);

        // Listen for delete button clicks
        const thiz = this;
        chipDel.addEventListener("click", function() {
            // Remove the associated keyword
            thiz.removeKeywordIdx(keywordIdx);
        }, false);

        // Append to chip area, followed by a space
        this._elChipArea.appendChild(chip);
        this._elChipArea.appendChild(document.createTextNode(" "));
    }

    // Show placeholder text on search input box if no keywords entered
    if (this._keywords.length > 0) {
        this._elInputBox.placeholder = "";
    } else {
        this._elInputBox.placeholder = this._placeholderText;
    }
};

//
// Modal Dialog Handling
//

/**
 * The ID of the problem for which the edit modal is currently shown, or -1 if it isn't shown.
 * @type {number}
 */
var editModalOutstandingProblem = -1;

/**
 * The keyword input control instance for the edit modal.
 * @type {KeywordInput}
 */
var editModalKeywordInput = null;

/**
 * The ID of the problem for which the trash modal is currently shown, or -1 if it isn't shown.
 * @type {number}
 */
var trashModalOutstandingProblem = -1;

/**
 * Event handler. Called when the edit modal confirms.
 */
function onEditModalConfirm() {
    if (editModalOutstandingProblem === -1) {
        console.error("Edit modal not shown");
        return;
    }

    // Get edited content
    var content = $("#edit-input-area").val();

    // Get keywords
    var keywords = editModalKeywordInput.getKeywords();

    // Complete the confirmation
    function complete() {
        // Clear outstanding problem
        editModalOutstandingProblem = -1;

        // Hide modal
        $("#modal-edit").modal("hide");

        // Refresh result table
        refreshResultTable();
    }

    if (editModalOutstandingProblem === -2) {
        // Currently editing in create mode

        // Send a create request to the server
        apiCreate(content, function(err, res) {
            if (err) {
                console.error("Create failed: " + err);
                return;
            }

            // Get ID of new problem
            var pid = res["pid"];

            // Send a keyword add request to the server
            // All provided keywords will be associated with the new problem
            if (keywords.length > 0) {
                apiKeyword("add", keywords.join(","), pid, function(err, res) {
                    if (err) {
                        console.error("Add keywords failed: " + err);
                        return;
                    }

                    complete();
                });
            } else {
                complete();
            }
        });
    } else {
        // Editing an existing problem

        // Send edit request to server
        apiUpdate(editModalOutstandingProblem, content, function(err, res) {
            if (err) {
                console.error("Update failed: " + err);
                return;
            }

            complete();
        });
    }
}

/**
 * Event handler. Called when the edit input area's content is changed by the user.
 */
function onEditInputAreaUpdate() {
    if (editModalOutstandingProblem === -1) {
        console.error("Edit modal not shown");
        return;
    }

    // Get problem content source
    var content = $("#edit-input-area").val();

    // Update rendered preview
    if (content !== "") {
        $("#edit-preview-area").html(content);
    } else {
        $("#edit-preview-area").html("<i>There is no content to display.</i>");
    }

    // Re-run MathJax typesetting
    // Is there a way to specify only to typeset the modal dialog? Is that even necessary?
    MathJax.Hub.Queue(["Typeset", MathJax.Hub]);
}

/**
 * Event handler. Called when the trash modal confirms.
 */
function onTrashModalConfirm() {
    if (trashModalOutstandingProblem === -1) {
        console.error("Trash modal not shown");
        return;
    }

    // Send trash move request to server
    apiTrash("move", trashModalOutstandingProblem, function(err, res) {
        if (err) {
            console.error("Move to trash failed: " + err);
            return;
        }

        // Clear outstanding problem
        trashModalOutstandingProblem = -1;

        // Hide modal
        $("#modal-trash").modal("hide");

        // Refresh result table
        refreshResultTable();
    });
}

/**
 * Event handler. Called when the empty trash modal confirms.
 */
function onEmptyTrashModalConfirm() {
    // Send trash empty request to server
    apiTrash("empty", 0, function(err, res) {
        if (err) {
            console.error("Empty trash failed: " + err);
            return;
        }

        // Hide modal
        $("#modal-empty-trash").modal("hide");

        // Refresh result table
        refreshResultTable();
    });
}

/**
 * Show the edit modal for the given problem. This is also repurposed for composition as needed.
 *
 * @param {Boolean} createMode True to edit in create mode, otherwise false
 * @param {Number} problem The ID of the target problem
 * @param {String} content The initial problem content source to display
 * @param {Array} keywords The initial problem keywords to display
 */
function showEditModal(createMode, problem, content, keywords) {
    // Set outstanding problem
    if (createMode) {
        // -2 represents a new problem
        editModalOutstandingProblem = -2;
    } else {
        editModalOutstandingProblem = problem;
    }

    var modalEdit = $("#modal-edit");

    // Find keyword input stuff
    var inputArea = modalEdit.find(".keyword-input-area").get(0);
    var chipArea = modalEdit.find(".keyword-input-chip-area").get(0);
    var inputBox = modalEdit.find(".keyword-input-box").get(0);

    // Set up keyword input
    if (editModalKeywordInput) {
        editModalKeywordInput.dispose();
    }
    editModalKeywordInput = new KeywordInput(inputArea, chipArea, inputBox, "Keywords");

    // Add given keywords
    for (var i = 0; i < keywords.length; ++i) {
        editModalKeywordInput.addKeyword(keywords[i]);
    }

    // Listen for keyword events and provide live updates to server
    // Do this only when not in create mode, however
    if (!createMode) {
        editModalKeywordInput.addOnKeywordAddListener(function(keyword) {
            // Send keyword add request to server
            apiKeyword("add", keyword, problem, function(err, res) {
                if (err) {
                    console.error("Unable to add keyword: " + err);
                }

                // Refresh result table
                refreshResultTable();
            });
        });
        editModalKeywordInput.addOnKeywordRemoveListener(function(keyword) {
            // Send keyword remove request to server
            apiKeyword("remove", keyword, problem, function(err, res) {
                if (err) {
                    console.error("Unable to remove keyword: " + err);
                }

                // Refresh result table
                refreshResultTable();
            });
        });
    }

    // Configure title
    if (createMode) {
        modalEdit.find(".modal-title").text("Compose New Problem");
    } else {
        modalEdit.find(".modal-title").text("Editing Problem " + problem);
    }

    // Show modal
    modalEdit.modal("show");

    // Set input area text to existing problem content source
    $("#edit-input-area").val(content);

    // Preliminary update
    onEditInputAreaUpdate();
}

/**
 * Show the trash modal for the given problem.
 *
 * @param {Number} problem The ID of the target problem
 */
function showTrashModal(problem) {
    // Set outstanding problem
    trashModalOutstandingProblem = problem;

    // Configure and show modal
    var modalTrash = $("#modal-trash");
    modalTrash.find(".modal-body p").html("Are you sure you want to move <b>problem " + problem + "</b>"
        + " to the trash? You can undo this action later.");
    modalTrash.modal("show");
}

/**
 * Show the empty trash modal.
 *
 * @param {Number} count The number of problems in the trash
 */
function showEmptyTrashModal(count) {
    // Configure and show modal
    var modalTrash = $("#modal-empty-trash");
    modalTrash.find(".modal-body p").html("Are you sure you want to empty <b>" + count + " problems</b>"
        + " from the trash? This cannot be undone.");
    modalTrash.modal("show");
}

//
// Result Table Handling
//

/**
 * The result table mode. 1 for list or 2 for search.
 * @type {number}
 */
var resultTableMode = 1;

/**
 * Render a list of problems into the result table.
 *
 * @param {Array} problemList The list of problems
 */
function renderResultTable(problemList) {
    // Find stuff
    var resultTable = document.getElementById("result-table");
    var resultTableTbody = resultTable.getElementsByTagName("tbody")[0];

    // Delete all existing table rows
    while (resultTableTbody.firstChild) {
        resultTableTbody.removeChild(resultTableTbody.firstChild);
    }

    // Create new table rows for problems
    for (var i = 0; i < problemList.length; ++i) {
        var problem = problemList[i];

        // Decode the Base64-encoded problem content and add it directly as HTML
        // We are trusting the server not to send anything malicious at this point
        const problemPid = problem["pid"];
        const problemContent = atob(problem["content"]);
        const problemKeywords = problem["keywords"];

        // Row root element
        var row = document.createElement("tr");

        // Row order column
        var rowOrder = document.createElement("td");
        rowOrder.style.whiteSpace = "nowrap";
        rowOrder.appendChild(document.createTextNode(i + 1));
        row.appendChild(rowOrder);

        // Row ID column
        var rowId = document.createElement("td");
        rowId.style.whiteSpace = "nowrap";
        rowId.appendChild(document.createTextNode(problemPid));
        row.appendChild(rowId);

        // Row problem column
        var rowProblem = document.createElement("td");
        row.appendChild(rowProblem);

        // Problem content area
        var problemContentArea = document.createElement("div");
        problemContentArea.classList.add("content-area");
        problemContentArea.innerHTML = problemContent;
        rowProblem.appendChild(problemContentArea);

        // Row action column
        var rowAction = document.createElement("td");
        rowAction.style.whiteSpace = "nowrap";
        row.appendChild(rowAction);

        // Don't allow problems to be reordered in search mode
        // This wouldn't make much sense, as they're already sorted by search relevance
        if (resultTableMode !== 2) {
            // Move up action button
            var actionUp = document.createElement("button");
            actionUp.classList.add("btn", "btn-default");
            rowAction.appendChild(actionUp);
            rowAction.appendChild(document.createTextNode(" "));

            // Listen for move up action button clicks
            actionUp.addEventListener("click", function() {
                alert("clicked MOVE UP action button on problem " + problemPid);
            }, false);

            // Icon for move up action button
            var actionUpIcon = document.createElement("span");
            actionUpIcon.classList.add("glyphicon", "glyphicon-chevron-up");
            actionUp.appendChild(actionUpIcon);

            // Move down action button
            var actionDown = document.createElement("button");
            actionDown.classList.add("btn", "btn-default");
            rowAction.appendChild(actionDown);
            rowAction.appendChild(document.createTextNode(" "));

            // Listen for move down action button clicks
            actionDown.addEventListener("click", function() {
                alert("clicked MOVE DOWN action button on problem " + problemPid);
            }, false);

            // Icon for move down action button
            var actionDownIcon = document.createElement("span");
            actionDownIcon.classList.add("glyphicon", "glyphicon-chevron-down");
            actionDown.appendChild(actionDownIcon);
        }

        // Edit action button
        var actionEdit = document.createElement("button");
        actionEdit.classList.add("btn", "btn-default");
        rowAction.appendChild(actionEdit);
        rowAction.appendChild(document.createTextNode(" "));

        // Listen for edit action button clicks
        actionEdit.addEventListener("click", function() {
            const pid = problemPid;
            const content = problemContent;
            const keywords = problemKeywords;
            showEditModal(false, pid, content, keywords);
        }, false);

        // Icon for edit action button
        var actionEditIcon = document.createElement("span");
        actionEditIcon.classList.add("glyphicon", "glyphicon-pencil");
        actionEdit.appendChild(actionEditIcon);

        // Trash action button
        var actionTrash = document.createElement("button");
        actionTrash.classList.add("btn", "btn-default");
        rowAction.appendChild(actionTrash);

        // Listen for trash action button clicks
        actionTrash.addEventListener("click", function() {
            showTrashModal(problemPid);
        }, false);

        // Icon for trash action button
        var actionTrashIcon = document.createElement("span");
        actionTrashIcon.classList.add("glyphicon", "glyphicon-trash");
        actionTrash.appendChild(actionTrashIcon);

        // Add row to table
        resultTableTbody.appendChild(row);
    }
}

/**
 * Refresh the result table.
 */
function refreshResultTable() {
    // Get trash count
    apiTrash("count", 0, function(err, res) {
        if (err) {
            console.error("Could not refresh result table (get trash count): " + err);
            return;
        }

        // The trash count
        var trashCount = res["count"];

        // Show trash buttons if something is in trash
        if (trashCount > 0) {
            $("#trash-buttons").show();
        } else {
            $("#trash-buttons").hide();
        }

        if (resultTableMode === 1) {
            // Result table is in list mode
            // Send list request to server
            // TODO: Pagination
            apiList(1, 1, function(err, res) {
                if (err) {
                    console.error("Could not refresh result table (list): " + err);
                    return;
                }

                // Re-render result table
                renderResultTable(res["problems"]);

                // Re-run MathJax typesetting
                MathJax.Hub.Queue(["Typeset", MathJax.Hub]);
            });
        } else if (resultTableMode === 2) {
            // Result table is in search mode
            // Send search request to server
            // TODO: Pagination?
            apiSearch(["triangle"], function(err, res) {
                if (err) {
                    console.error("Could not refresh result table (search): " + err);
                    return;
                }

                // Re-render result table
                renderResultTable(res["problems"]);

                // Re-run MathJax typesetting
                MathJax.Hub.Queue(["Typeset", MathJax.Hub]);
            });
        }
    });
}

//
// API Communication
//

/**
 * Communicate with the create API endpoint.
 *
 * @param content The new problem content
 * @param callback A function to receive the result
 */
function apiCreate(content, callback) {
    var request = new XMLHttpRequest();
    request.open("POST", "/api/create.php", true);
    request.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    request.onreadystatechange = function() {
        if (request.readyState === XMLHttpRequest.DONE && request.status === 200) {
            var responseObject = JSON.parse(request.responseText);
            if (!responseObject["success"]) {
                callback("FAIL: " + responseObject["error"]);
            } else {
                callback(null, responseObject["result"]);
            }
        }
    };
    request.send("content=" + encodeURI(content));
}

/**
 * Communicate with the keyword API endpoint.
 *
 * @param action "add", "remove", or "suggest"
 * @param keyword The keyword text
 * @param pid The ID of the target problem
 * @param callback A function to receive the result
 */
function apiKeyword(action, keyword, pid, callback) {
    var request = new XMLHttpRequest();
    request.open("GET", "/api/keyword.php?action=" + action + "&keyword=" + keyword + "&pid=" + pid, true);
    request.onreadystatechange = function() {
        if (request.readyState === XMLHttpRequest.DONE && request.status === 200) {
            var responseObject = JSON.parse(request.responseText);
            if (!responseObject["success"]) {
                callback("FAIL: " + responseObject["error"]);
            } else {
                callback(null, responseObject["result"]);
            }
        }
    };
    request.send();
}

/**
 * Communicate with the list API endpoint.
 *
 * @param {Number} pageNum The desired page
 * @param {Number} pageSize The size of the page
 * @param {Function} callback A function to receive the result
 */
function apiList(pageNum, pageSize, callback) {
    var request = new XMLHttpRequest();
    request.open("GET", "/api/list.php?page_num=" + pageNum + "&page_size=" + pageSize, true);
    request.onreadystatechange = function() {
        if (request.readyState === XMLHttpRequest.DONE && request.status === 200) {
            var responseObject = JSON.parse(request.responseText);
            if (!responseObject["success"]) {
                callback("FAIL: " + responseObject["error"]);
            } else {
                callback(null, responseObject["result"]);
            }
        }
    };
    request.send();
}

/**
 * Communicate with the move API endpoint.
 *
 * @param {String} pid The ID of the target problem
 * @param {String} dir "up" to move up one or "down" to move down one
 * @param {Function} callback A function to receive the result
 */
function apiMove(pid, dir, callback) {
    var request = new XMLHttpRequest();
    request.open("GET", "/api/move.php?pid=" + pid + "&dir=" + dir, true);
    request.onreadystatechange = function() {
        if (request.readyState === XMLHttpRequest.DONE && request.status === 200) {
            var responseObject = JSON.parse(request.responseText);
            if (!responseObject["success"]) {
                callback("FAIL: " + responseObject["error"]);
            } else {
                callback(null, responseObject["result"]);
            }
        }
    };
    request.send();
}

/**
 * Communicate with the search API endpoint.
 *
 * @param {Array} keywords The keywords for which to search
 * @param {Function} callback A function to receive the result
 */
function apiSearch(keywords, callback) {
    var request = new XMLHttpRequest();
    request.open("GET", "/api/search.php?keywords=" + encodeURI(keywords.join(",")), true);
    request.onreadystatechange = function() {
        if (request.readyState === XMLHttpRequest.DONE && request.status === 200) {
            var responseObject = JSON.parse(request.responseText);
            if (!responseObject["success"]) {
                callback("FAIL: " + responseObject["error"]);
            } else {
                callback(null, responseObject["result"]);
            }
        }
    };
    request.send();
}

/**
 * Communicate with the trash API endpoint.
 *
 * @param {String} action "empty", "count", "move", or "undo"
 * @param {Number} pid The ID of the target problem
 * @param {Function} callback A function to receive the result
 */
function apiTrash(action, pid, callback) {
    var request = new XMLHttpRequest();
    request.open("GET", "/api/trash.php?action=" + action + "&pid=" + pid, true);
    request.onreadystatechange = function() {
        if (request.readyState === XMLHttpRequest.DONE && request.status === 200) {
            var responseObject = JSON.parse(request.responseText);
            if (!responseObject["success"]) {
                callback("FAIL: " + responseObject["error"]);
            } else {
                callback(null, responseObject["result"]);
            }
        }
    };
    request.send();
}

/**
 * Communicate with the update API endpoint.
 *
 * @param pid The ID of the target problem
 * @param content The new problem content
 * @param callback A function to receive the result
 */
function apiUpdate(pid, content, callback) {
    var request = new XMLHttpRequest();
    request.open("POST", "/api/update.php", true);
    request.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    request.onreadystatechange = function() {
        if (request.readyState === XMLHttpRequest.DONE && request.status === 200) {
            var responseObject = JSON.parse(request.responseText);
            if (!responseObject["success"]) {
                callback("FAIL: " + responseObject["error"]);
            } else {
                callback(null, responseObject["result"]);
            }
        }
    };
    request.send("pid=" + pid + "&content=" + encodeURI(content));
}

//
// App Functions
//

/**
 * Begin the empty trash flow.
 */
function startEmptyTrash() {
    // Get trash count
    apiTrash("count", 0, function(err, res) {
        if (err) {
            console.error("Empty trash failed (get trash count): " + err);
            return;
        }

        // The trash count
        var trashCount = res["count"];

        // Continue flow with empty trash modal dialog
        showEmptyTrashModal(trashCount);
    });
}

/**
 * Undo the last moved-to-trash problem.
 */
function doUndoTrash() {
    apiTrash("undo", 0, function(err, res) {
        if (err) {
            console.error("Undo trash failed: " + err);
            return;
        }

        // Refresh result table
        refreshResultTable();
    });
}

/**
 * The main keyword search input instance.
 */
var keywordSearchInput;

// Listen for window load
window.addEventListener("load", function() {
    // Find stuff
    var searchInputArea = document.getElementById("search-input-area");
    var searchChipArea = document.getElementById("search-chips");
    var searchInputBox = document.getElementById("search-input");

    // Configure main keyword search input
    keywordSearchInput = new KeywordInput(searchInputArea, searchChipArea, searchInputBox, "Keyword search");

    // Preliminary result table refresh
    refreshResultTable();
}, false);
