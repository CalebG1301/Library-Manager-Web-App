const bookForm = document.getElementById("book-form");
const editForm = document.getElementById("edit-form");

const titleInput = document.getElementById("title");
const authorInput = document.getElementById("author");
const categoryInput = document.getElementById("category");
const yearInput = document.getElementById("year");

const searchInput = document.getElementById("search");
const sortSelect = document.getElementById("sort-books");

const bookList = document.getElementById("book-list");
const emptyState = document.getElementById("empty-state");

const totalBooksElement = document.getElementById("total-books");
const availableBooksElement = document.getElementById("available-books");
const checkedOutBooksElement = document.getElementById(
    "checked-out-books"
);

const themeToggle = document.getElementById("theme-toggle");
const themeIcon = document.getElementById("theme-icon");
const themeText = document.getElementById("theme-text");

const notification = document.getElementById("notification");

const editModal = document.getElementById("edit-modal");
const closeModalButton = document.getElementById("close-modal");
const cancelEditButton = document.getElementById("cancel-edit");

const editIdInput = document.getElementById("edit-id");
const editTitleInput = document.getElementById("edit-title");
const editAuthorInput = document.getElementById("edit-author");
const editCategoryInput = document.getElementById("edit-category");
const editYearInput = document.getElementById("edit-year");

const filterButtons = document.querySelectorAll(".filter-button");

let books = loadBooks();
let activeFilter = "all";
let notificationTimer;

if (books.length === 0) {
    books = [
        {
            id: 1,
            title: "Clean Code",
            author: "Robert C. Martin",
            category: "Programming",
            year: 2008,
            isAvailable: true,
            createdAt: Date.now() - 3000
        },
        {
            id: 2,
            title: "The Pragmatic Programmer",
            author: "Andrew Hunt",
            category: "Programming",
            year: 1999,
            isAvailable: true,
            createdAt: Date.now() - 2000
        },
        {
            id: 3,
            title: "Atomic Habits",
            author: "James Clear",
            category: "Self-Improvement",
            year: 2018,
            isAvailable: false,
            createdAt: Date.now() - 1000
        }
    ];

    saveBooks();
}

loadTheme();
renderBooks();

function loadBooks() {
    try {
        const savedBooks = localStorage.getItem("libraryBooks");

        if (!savedBooks) {
            return [];
        }

        const parsedBooks = JSON.parse(savedBooks);

        if (!Array.isArray(parsedBooks)) {
            return [];
        }

        return parsedBooks.map((book, index) => ({
            ...book,
            createdAt:
                book.createdAt ??
                Date.now() - parsedBooks.length + index
        }));
    } catch (error) {
        console.error("Unable to load books:", error);
        return [];
    }
}

function saveBooks() {
    try {
        localStorage.setItem(
            "libraryBooks",
            JSON.stringify(books)
        );
    } catch (error) {
        console.error("Unable to save books:", error);
        showNotification(
            "Your changes could not be saved.",
            "error"
        );
    }
}

function createBook(title, author, category, year) {
    return {
        id: Date.now(),
        title,
        author,
        category,
        year,
        isAvailable: true,
        createdAt: Date.now()
    };
}

function renderBooks() {
    bookList.innerHTML = "";

    const visibleBooks = getVisibleBooks();

    visibleBooks.forEach((book) => {
        bookList.appendChild(createBookCard(book));
    });

    emptyState.classList.toggle(
        "visible",
        visibleBooks.length === 0
    );

    updateStatistics();
}

function getVisibleBooks() {
    const searchTerm = searchInput.value
        .trim()
        .toLowerCase();

    let visibleBooks = books.filter((book) => {
        const matchesSearch =
            book.title.toLowerCase().includes(searchTerm) ||
            book.author.toLowerCase().includes(searchTerm) ||
            book.category.toLowerCase().includes(searchTerm);

        const matchesFilter =
            activeFilter === "all" ||
            (
                activeFilter === "available" &&
                book.isAvailable
            ) ||
            (
                activeFilter === "checked-out" &&
                !book.isAvailable
            );

        return matchesSearch && matchesFilter;
    });

    visibleBooks = sortBooks(
        visibleBooks,
        sortSelect.value
    );

    return visibleBooks;
}

function sortBooks(bookArray, sortOption) {
    const sortedBooks = [...bookArray];

    switch (sortOption) {
        case "title":
            return sortedBooks.sort((a, b) =>
                a.title.localeCompare(b.title)
            );

        case "author":
            return sortedBooks.sort((a, b) =>
                a.author.localeCompare(b.author)
            );

        case "category":
            return sortedBooks.sort((a, b) =>
                a.category.localeCompare(b.category)
            );

        case "year-newest":
            return sortedBooks.sort(
                (a, b) => b.year - a.year
            );

        case "year-oldest":
            return sortedBooks.sort(
                (a, b) => a.year - b.year
            );

        case "newest":
        default:
            return sortedBooks.sort(
                (a, b) => b.createdAt - a.createdAt
            );
    }
}

function createBookCard(book) {
    const article = document.createElement("article");
    article.className = "book-card";

    const statusClass = book.isAvailable
        ? "status-available"
        : "status-checked-out";

    const statusText = book.isAvailable
        ? "Available"
        : "Checked Out";

    const statusIcon = book.isAvailable ? "●" : "●";

    article.innerHTML = `
        <div class="book-card-header">
            <div class="book-cover" aria-hidden="true">
                📘
            </div>

            <div>
                <h3>${escapeHtml(book.title)}</h3>

                <p class="book-author">
                    ${escapeHtml(book.author)}
                </p>
            </div>
        </div>

        <div class="book-details">
            <div class="detail-item">
                <span class="detail-label">Category</span>

                <span class="detail-value">
                    ${escapeHtml(book.category)}
                </span>
            </div>

            <div class="detail-item">
                <span class="detail-label">
                    Publication Year
                </span>

                <span class="detail-value">
                    ${escapeHtml(String(book.year))}
                </span>
            </div>
        </div>

        <div class="status-badge ${statusClass}">
            <span aria-hidden="true">${statusIcon}</span>
            ${statusText}
        </div>

        <div class="book-actions">
            <button
                type="button"
                class="edit-button"
                data-action="edit"
                data-id="${book.id}"
            >
                Edit
            </button>

            <button
                type="button"
                class="toggle-button"
                data-action="toggle"
                data-id="${book.id}"
            >
                ${book.isAvailable ? "Check Out" : "Return"}
            </button>

            <button
                type="button"
                class="delete-button"
                data-action="delete"
                data-id="${book.id}"
            >
                Delete
            </button>
        </div>
    `;

    return article;
}

function updateStatistics() {
    const totalBooks = books.length;

    const availableBooks = books.filter(
        (book) => book.isAvailable
    ).length;

    const checkedOutBooks = totalBooks - availableBooks;

    totalBooksElement.textContent = totalBooks;
    availableBooksElement.textContent = availableBooks;
    checkedOutBooksElement.textContent = checkedOutBooks;
}

function addBook(event) {
    event.preventDefault();

    const title = titleInput.value.trim();
    const author = authorInput.value.trim();
    const category = categoryInput.value.trim();
    const year = Number(yearInput.value);

    if (!isValidBook(title, author, category, year)) {
        showNotification(
            "Please enter valid information in every field.",
            "error"
        );

        return;
    }

    books.push(
        createBook(title, author, category, year)
    );

    saveBooks();
    renderBooks();

    bookForm.reset();
    titleInput.focus();

    showNotification(`"${title}" was added successfully.`);
}

function isValidBook(title, author, category, year) {
    return (
        title.length > 0 &&
        author.length > 0 &&
        category.length > 0 &&
        Number.isInteger(year) &&
        year >= 1000 &&
        year <= 2100
    );
}

function toggleBookStatus(bookId) {
    const book = books.find(
        (currentBook) => currentBook.id === bookId
    );

    if (!book) {
        return;
    }

    book.isAvailable = !book.isAvailable;

    saveBooks();
    renderBooks();

    const message = book.isAvailable
        ? `"${book.title}" was returned.`
        : `"${book.title}" was checked out.`;

    showNotification(message);
}

function openEditModal(bookId) {
    const book = books.find(
        (currentBook) => currentBook.id === bookId
    );

    if (!book) {
        return;
    }

    editIdInput.value = String(book.id);
    editTitleInput.value = book.title;
    editAuthorInput.value = book.author;
    editCategoryInput.value = book.category;
    editYearInput.value = String(book.year);

    editModal.classList.remove("hidden");
    document.body.style.overflow = "hidden";

    editTitleInput.focus();
}

function closeEditModal() {
    editModal.classList.add("hidden");
    document.body.style.overflow = "";
    editForm.reset();
}

function saveEditedBook(event) {
    event.preventDefault();

    const bookId = Number(editIdInput.value);
    const title = editTitleInput.value.trim();
    const author = editAuthorInput.value.trim();
    const category = editCategoryInput.value.trim();
    const year = Number(editYearInput.value);

    if (!isValidBook(title, author, category, year)) {
        showNotification(
            "Please enter valid information in every field.",
            "error"
        );

        return;
    }

    books = books.map((book) => {
        if (book.id !== bookId) {
            return book;
        }

        return {
            ...book,
            title,
            author,
            category,
            year
        };
    });

    saveBooks();
    renderBooks();
    closeEditModal();

    showNotification(`"${title}" was updated successfully.`);
}

function deleteBook(bookId) {
    const book = books.find(
        (currentBook) => currentBook.id === bookId
    );

    if (!book) {
        return;
    }

    const shouldDelete = window.confirm(
        `Are you sure you want to delete "${book.title}"?`
    );

    if (!shouldDelete) {
        return;
    }

    books = books.filter(
        (currentBook) => currentBook.id !== bookId
    );

    saveBooks();
    renderBooks();

    showNotification(`"${book.title}" was deleted.`);
}

function showNotification(message, type = "success") {
    clearTimeout(notificationTimer);

    notification.textContent = message;
    notification.classList.toggle(
        "error",
        type === "error"
    );

    notification.classList.add("show");

    notificationTimer = setTimeout(() => {
        notification.classList.remove("show");
    }, 2600);
}

function setActiveFilter(selectedButton) {
    filterButtons.forEach((button) => {
        button.classList.remove("active");
    });

    selectedButton.classList.add("active");
    activeFilter = selectedButton.dataset.filter;

    renderBooks();
}

function loadTheme() {
    const savedTheme = localStorage.getItem(
        "libraryTheme"
    );

    if (savedTheme === "dark") {
        document.body.classList.add("dark-mode");
    }

    updateThemeButton();
}

function toggleTheme() {
    document.body.classList.toggle("dark-mode");

    const theme = document.body.classList.contains(
        "dark-mode"
    )
        ? "dark"
        : "light";

    localStorage.setItem("libraryTheme", theme);

    updateThemeButton();
}

function updateThemeButton() {
    const darkModeEnabled =
        document.body.classList.contains("dark-mode");

    themeIcon.textContent = darkModeEnabled ? "☀️" : "🌙";
    themeText.textContent = darkModeEnabled
        ? "Light Mode"
        : "Dark Mode";

    themeToggle.setAttribute(
        "aria-label",
        darkModeEnabled
            ? "Switch to light mode"
            : "Switch to dark mode"
    );
}

function escapeHtml(value) {
    const element = document.createElement("div");
    element.textContent = value;
    return element.innerHTML;
}

bookForm.addEventListener("submit", addBook);
editForm.addEventListener("submit", saveEditedBook);

searchInput.addEventListener("input", renderBooks);
sortSelect.addEventListener("change", renderBooks);

themeToggle.addEventListener("click", toggleTheme);

filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
        setActiveFilter(button);
    });
});

bookList.addEventListener("click", (event) => {
    const button = event.target.closest("button");

    if (!button) {
        return;
    }

    const bookId = Number(button.dataset.id);
    const action = button.dataset.action;

    if (!Number.isFinite(bookId)) {
        return;
    }

    if (action === "edit") {
        openEditModal(bookId);
    }

    if (action === "toggle") {
        toggleBookStatus(bookId);
    }

    if (action === "delete") {
        deleteBook(bookId);
    }
});

closeModalButton.addEventListener(
    "click",
    closeEditModal
);

cancelEditButton.addEventListener(
    "click",
    closeEditModal
);

editModal.addEventListener("click", (event) => {
    if (event.target.hasAttribute("data-close-modal")) {
        closeEditModal();
    }
});

document.addEventListener("keydown", (event) => {
    if (
        event.key === "Escape" &&
        !editModal.classList.contains("hidden")
    ) {
        closeEditModal();
    }
});