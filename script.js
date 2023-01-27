("use strict");

const body = document.querySelector("body");
const formImage = document.querySelector(".comment-form-img");
const modal = document.querySelector(".modal");
const overlay = document.querySelector(".overlay");
const submitCommentBtn = document.querySelector(".comment-form-btn");
const commentForm = document.querySelector(".comment-form-container");
let currentUser = {};
let commentObject;
let currentUserImg;
let commentToDelete;
let comments = [];
let currentTime = Date.now();
let id;

window.addEventListener("load", () => {
  fetch("data.json")
    .then((res) => res.json())
    .then((data) => app(data));
});

const app = (data) => {
  // currentUserImg = data.currentUser.image.png;
  // currentUser = data.currentUser.username;
  currentUser = {
    img: data.currentUser.image.png,
    username: data.currentUser.username,
  };
  formImage.src = currentUser.img;
  // formImage.src = currentUserImg;
  let commentsLocal = getLocalStorage();
  if (!commentsLocal) {
    comments = data.comments;
  } else comments = commentsLocal;

  let arrObjIds = comments.map((el) => el.id);
  let arrObjObjIds;
  comments.forEach((comment) => {
    if (comment.replies.length === 0) return;
    arrObjObjIds = comment.replies.map((el) => el.id);
  });
  arrObjIds.push(...arrObjObjIds);
  id = Math.max(...arrObjIds);
  id++;

  comments.sort((a, b) => a.score - b.score);

  comments.forEach((comment) => {
    renderComment(comment);
    attachEventListeners(comment);

    if (comment.replies.length === 0) return;
    comment.replies.sort((a, b) => a.createdAt - b.createdAt);

    comment.replies.forEach((reply, index, arr) => {
      // if (index === arr.length - 1) {
      //   renderComment(reply, true);
      //   attachEventListeners(reply, true);
      //   return;
      // }
      renderComment(reply, true);
      attachEventListeners(reply, true);
    });
  });

  checkForCurrentUser();
};

const renderComment = (
  comment,
  reply = false,
  last = false,
  newComment = false
) => {
  const html = `
  <div class="comment-container" data-user=${
    comment.user.username
  } data-reply=${reply ? true : false} data-id=${comment.id}>
  <div class="comment-line"></div>
  <div class="comment">
      <img
        class="comment-avatar"
        src="/dist/images/avatars/image-${comment.user.username}.png"
        alt="Avatar"
      />
      <div class="comment-author">${comment.user.username}</div>
      <div class="comment-you">you</div>
      <div class="comment-date">${relativeTime(comment.createdAt)}</div>
      <div class="comment-text">
      <span class="comment-tag">${reply ? "@" + comment.replyingTo : ""}</span>
        ${comment.content}
      </div>
      <div class="comment-points">
        <svg width="11" height="11" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M6.33 10.896c.137 0 .255-.05.354-.149.1-.1.149-.217.149-.354V7.004h3.315c.136 0 .254-.05.354-.149.099-.1.148-.217.148-.354V5.272a.483.483 0 0 0-.148-.354.483.483 0 0 0-.354-.149H6.833V1.4a.483.483 0 0 0-.149-.354.483.483 0 0 0-.354-.149H4.915a.483.483 0 0 0-.354.149c-.1.1-.149.217-.149.354v3.37H1.08a.483.483 0 0 0-.354.15c-.1.099-.149.217-.149.353v1.23c0 .136.05.254.149.353.1.1.217.149.354.149h3.333v3.39c0 .136.05.254.15.353.098.1.216.149.353.149H6.33Z"
            fill="#C5C6EF"
          />
        </svg>
        <span class="comment-points-number">${comment.score}</span>
        <svg width="11" height="3" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M9.256 2.66c.204 0 .38-.056.53-.167.148-.11.222-.243.222-.396V.722c0-.152-.074-.284-.223-.395a.859.859 0 0 0-.53-.167H.76a.859.859 0 0 0-.53.167C.083.437.009.57.009.722v1.375c0 .153.074.285.223.396a.859.859 0 0 0 .53.167h8.495Z"
            fill="#C5C6EF"
          />
        </svg>
      </div>
      <div class="comment-delete">
        <svg width="12" height="14" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M1.167 12.448c0 .854.7 1.552 1.555 1.552h6.222c.856 0 1.556-.698 1.556-1.552V3.5H1.167v8.948Zm10.5-11.281H8.75L7.773 0h-3.88l-.976 1.167H0v1.166h11.667V1.167Z"
            fill="#ED6368"
          />
        </svg>
        <p>Delete</p>
      </div>
      <div class="comment-reply">
        <svg width="14" height="13" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M.227 4.316 5.04.16a.657.657 0 0 1 1.085.497v2.189c4.392.05 7.875.93 7.875 5.093 0 1.68-1.082 3.344-2.279 4.214-.373.272-.905-.07-.767-.51 1.24-3.964-.588-5.017-4.829-5.078v2.404c0 .566-.664.86-1.085.496L.227 5.31a.657.657 0 0 1 0-.993Z"
            fill="#5357B6"
          />
        </svg>
        <p>Reply</p>
      </div>
      <div class="comment-edit">
        <svg width="14" height="14" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M13.479 2.872 11.08.474a1.75 1.75 0 0 0-2.327-.06L.879 8.287a1.75 1.75 0 0 0-.5 1.06l-.375 3.648a.875.875 0 0 0 .875.954h.078l3.65-.333c.399-.04.773-.216 1.058-.499l7.875-7.875a1.68 1.68 0 0 0-.061-2.371Zm-2.975 2.923L8.159 3.449 9.865 1.7l2.389 2.39-1.75 1.706Z"
            fill="#5357B6"
          />
        </svg>
        <p>Edit</p>
      </div>
    </div>
  </div>
    `;

  if (!reply && newComment) {
    commentForm.insertAdjacentHTML("beforebegin", html);
    // attachEventListeners(comment);
    // checkForCurrentUser();
    return;
  }

  if (reply && !newComment) {
    const parentCommentEl = document.querySelector(
      `.comment-container[data-user="${comment.replyingTo}"`
    );
    // parentCommentEl.insertAdjacentHTML("afterend", html);

    let nextEl = parentCommentEl.nextElementSibling;

    while (nextEl.getAttribute("data-reply") === "true") {
      nextEl = nextEl.nextElementSibling;
    }

    nextEl = nextEl.previousElementSibling;
    nextEl.insertAdjacentHTML("afterend", html);
    showCommentLine(comment.user.username);

    // if (last) commentLineEl.style.marginBottom = "1rem";

    // attachEventListeners(comment, true);
    // checkForCurrentUser();

    return;
  }

  if (reply && newComment) {
    const parentCommentEl = document.querySelector(
      `.comment-container[data-user="${comment.replyingTo}"`
    );

    const commentEl = parentCommentEl.nextElementSibling;

    let nextEl = commentEl.nextElementSibling;

    if (nextEl.getAttribute("data-reply") === "false") {
      parentCommentEl.insertAdjacentHTML("afterend", html);

      showCommentLine(comment.user.username, true);

      return;
    }

    while (nextEl.getAttribute("data-reply") === "true") {
      nextEl = nextEl.nextElementSibling;
    }

    nextEl = nextEl.previousElementSibling;
    nextEl.insertAdjacentHTML("afterend", html);

    showCommentLine(comment.user.username, true);

    return;
  }

  body.insertAdjacentHTML("afterbegin", html);

  // const currentCommentEl = document.querySelector(
  //   `.comment-container[data-user="${comment.user.username}"]`
  // );
  // attachEventListeners(comment);
  // checkForCurrentUser();
};

const checkForCurrentUser = () => {
  const currentCommentEl = document.querySelectorAll(
    `.comment-container[data-user="${currentUser.username}"]`
  );

  currentCommentEl.forEach((commentEl) => {
    if (commentEl) {
      commentEl.querySelector(".comment-you").style.display = "block";
      commentEl.querySelector(".comment-reply").style.display = "none";
      commentEl.querySelector(".comment-delete").style.display = "block";
      commentEl.querySelector(".comment-edit").style.display = "block";
    }
  });
};

const attachEventListeners = (comment) => {
  const currentCommentEl = document.querySelectorAll(
    `.comment-container[data-user="${comment.user.username}"]`
  );

  currentCommentEl.forEach((commentEl) => {
    commentEl
      .querySelector(".comment-points")
      .firstElementChild.addEventListener("click", upVote);

    commentEl
      .querySelector(".comment-points")
      .lastElementChild.addEventListener("click", downVote);

    commentEl
      .querySelector(".comment-reply")
      .addEventListener("click", showReplyForm);

    commentEl
      .querySelector(".comment-delete")
      .addEventListener("click", showModal);

    commentEl
      .querySelector(".comment-edit")
      .addEventListener("click", editComment);
  });
};

const upVote = (e) => {
  let id = parseInt(
    e.target.closest(".comment-container").getAttribute("data-id")
  );
  let comment;
  comment = comments.find((comment) => comment.id === id);

  if (!comment) {
    comments.forEach((comm) => {
      if (comm.replies.length === 0) return;

      comment = comm.replies.find((com) => com.id === id);
    });
  }

  if (comment.votedBy && comment.votedBy.includes(currentUser.username))
    return alreadyVoted();

  const numberOfVotesEl = e.target.closest("svg").nextElementSibling;

  let numberOfVotes = parseInt(numberOfVotesEl.innerText);
  numberOfVotes++;

  numberOfVotesEl.innerText = numberOfVotes;

  saveVote(comment, "up");
};

const downVote = (e) => {
  let id = parseInt(
    e.target.closest(".comment-container").getAttribute("data-id")
  );
  let comment;
  comment = comments.find((comment) => comment.id === id);

  if (!comment) {
    comments.forEach((comm) => {
      if (comm.replies.length === 0) return;

      comment = comm.replies.find((com) => com.id === id);
    });
  }

  if (comment.votedBy && comment.votedBy.includes(currentUser.username))
    return alreadyVoted();

  const numberOfVotesEl = e.target.closest("svg").previousElementSibling;

  let numberOfVotes = parseInt(numberOfVotesEl.innerText);
  if (numberOfVotes === 0) return;
  numberOfVotes--;

  numberOfVotesEl.innerText = numberOfVotes;

  saveVote(comment, "down");
};

const saveVote = (comment, vote) => {
  comment.votedBy = [];
  comment.votedBy.push(currentUser.username);
  if (vote === "up") comment.score++;
  if (vote === "down") comment.score--;
  setLocalStorage(comments);
};

const alreadyVoted = () => {
  if (document.querySelector(".modal-info")) return;

  let html = `
  <div class="modal-info animate__animated animate__fadeInDown">
      <p>You already voted on this comment.</p>
    </div>
  `;

  body.insertAdjacentHTML("afterbegin", html);
  let el = document.querySelector(".modal-info");

  setTimeout(() => {
    el.classList.add("animate__fadeOutUp");
  }, 3000);

  setTimeout(() => {
    el.remove();
  }, 4000);
};

const showReplyForm = (e) => {
  const html = `
  <div class="container">
  <div class="comment-form-line"></div>
  <div class="comment-form-container">
      <form class="comment-form">
        <textarea
          type="input"
          class="comment-form-text"
          name="comment-form-text"
          placeholder="Add a comment..."
        ></textarea>

        <img alt="Current User's Avatar" class="comment-form-img" src="/dist/images/avatars/image-${currentUser.username}.png";/>
        <input type="submit" value="REPLY" class="comment-form-btn" />
      </form>
    </div>
    </div>
  `;

  const parentCommentEl = e.target.closest(".comment-container");

  let formOpen = parentCommentEl.getAttribute("formOpen");
  if (formOpen === "open") {
    parentCommentEl.nextElementSibling.remove();
    parentCommentEl.setAttribute("formOpen", "closed");
    return;
  }

  parentCommentEl.insertAdjacentHTML("afterend", html);

  if (parentCommentEl.querySelector(".comment-text").innerText[0] === "@") {
    parentCommentEl.nextElementSibling.querySelector(
      ".comment-form-line"
    ).style.display = "block";
  }

  // parentCommentEl.nextElementSibling.querySelector(
  //   ".comment-form-text"
  // ).innerText = `@${
  //   parentCommentEl.querySelector(".comment-author").innerText
  // } `;
  parentCommentEl.nextElementSibling
    .querySelector(".comment-form-text")
    .focus();

  parentCommentEl.setAttribute("formOpen", "open");
  // set this attribute to closed when adding reply
  // start working here

  parentCommentEl.nextElementSibling
    .querySelector(".comment-form-btn")
    .addEventListener("click", submitNewComment);
};

const showModal = (e) => {
  modal.classList.add("show");
  overlay.classList.add("show");
  commentToDelete = e.target.closest(".comment-container");

  overlay.addEventListener("click", hideModal);
  modal.querySelector(".modal-cancel").addEventListener("click", hideModal);
  modal.querySelector(".modal-delete").addEventListener("click", deleteComment);
};

const hideModal = () => {
  modal.classList.remove("show");
  overlay.classList.remove("show");
};

const deleteComment = () => {
  hideModal();
  commentToDelete.remove();
  let commentId = parseInt(commentToDelete.getAttribute("data-id"));

  let topLevel = false;
  let commentDelete;
  commentDelete = comments.find((comment) => comment.id === commentId);
  if (commentDelete) topLevel = true;
  if (!commentDelete)
    comments.forEach((comment) => {
      if (comment.replies.length === 0) return;

      commentDelete = comment.replies.find((comm) => comm.id === commentId);
    });

  if (topLevel)
    comments = comments.filter((comment) => comment !== commentDelete);

  if (!topLevel)
    comments.forEach((comment) => {
      if (comment.replies.length === 0) return;

      comment.replies = comment.replies.filter(
        (comm) => comm !== commentDelete
      );
    });

  setLocalStorage(comments);
};

let replyStr;
let content;
const editComment = (e) => {
  const textEl = e.target
    .closest(".comment-container")
    .querySelector(".comment-text");

  let updateBtn = `<input style="grid-column:6/9;grid-row:5;" type="submit" value="UPDATE" class="comment-form-btn" />`;
  textEl.closest(".comment").insertAdjacentHTML("afterbegin", updateBtn);
  textEl.style.gridRow = "2 / 5";

  textEl.contentEditable = "true";
  textEl.focus();

  content = textEl.innerText;
  if (content.slice(0, 1) === "@") {
    replyStr = content.split(" ")[0];

    content = content.substr(content.indexOf(" ") + 1);
  }

  textEl.innerText = content;

  e.target
    .closest(".comment")
    .querySelector(".comment-form-btn")
    .addEventListener("click", saveEdit);
};

const saveEdit = (e) => {
  let textEl = e.target.closest(".comment").querySelector(".comment-text");
  textEl.contentEditable = "false";
  textEl.blur();
  textEl.closest(".comment").querySelector(".comment-form-btn").remove();
  if (
    textEl.closest(".comment-container").getAttribute("data-reply") === "true"
  ) {
    let span = `
  <span class="comment-tag">${replyStr}</span>
  `;
    textEl.insertAdjacentHTML("afterbegin", span);
  }

  let topLevel = false;
  let id = parseInt(
    textEl.closest(".comment-container").getAttribute("data-id")
  );

  let updatingComment;
  updatingComment = comments.find((comment) => comment.id === id);
  if (updatingComment) topLevel = true;

  if (!updatingComment) {
    comments.forEach((comment) => {
      if (comment.replies.length === 0) return;

      updatingComment = comment.replies.find((com) => com.id === id);
    });
  }

  let content;
  if (topLevel) content = textEl.innerText;

  if (!topLevel)
    content = textEl.innerText.substr(textEl.innerText.indexOf(" ") + 1);

  updatingComment.content = content;
  setLocalStorage(comments);
  location.reload();
};

const submitNewComment = (e) => {
  e.preventDefault();
  let comment;

  let content = e.target
    .closest(".comment-form-container")
    .querySelector(".comment-form-text").value;

  if (!content) {
    e.target
      .closest(".comment-form-container")
      .querySelector(".comment-form-text").value =
      "Please write something before adding new comment!";

    e.target
      .closest(".comment-form-container")
      .querySelector(".comment-form-text").style.color = "red";

    e.target
      .closest(".comment-form-container")
      .querySelector(".comment-form-btn").disabled = true;

    setTimeout(() => {
      e.target
        .closest(".comment-form-container")
        .querySelector(".comment-form-text").value = "";

      e.target
        .closest(".comment-form-container")
        .querySelector(".comment-form-text").style.color = "hsl(211, 10%, 45%)";

      e.target
        .closest(".comment-form-container")
        .querySelector(".comment-form-btn").disabled = false;
    }, 3000);
    return;
  }

  comment = {
    id: id,
    content: content,
    createdAt: Date.now(),
    score: 0,
    user: {
      image: currentUser.image,
      username: currentUser.username,
    },
    replies: [],
  };

  if (e.target.value === "REPLY") {
    delete comment.replies;
    comment.replyingTo = e.target
      .closest(".container")
      .previousElementSibling.querySelector(".comment-author").innerText;
    let replyingToEl = e.target.closest(".container").previousElementSibling;
    while (replyingToEl.getAttribute("data-reply") === "true")
      replyingToEl = replyingToEl.previousElementSibling;
    let replyingToObj = comments.find(
      (comment) => comment.id === parseInt(replyingToEl.getAttribute("data-id"))
    );
    replyingToObj.replies.push(comment);
    replyingToObj.replies.sort((a, b) => a.createdAt - b.createdAt);
    setLocalStorage(comments);

    e.target
      .closest(".container")
      .previousElementSibling.setAttribute("formOpen", "closed");
    renderComment(comment, true, false, true);
    e.target.closest(".container").remove();
    checkForCurrentUser();
    attachEventListeners(comment);
    location.reload();

    return;
  }

  comments.push(comment);
  comments.sort((a, b) => a.score - b.score);
  setLocalStorage(comments);

  e.target
    .closest(".comment-form-container")
    .querySelector(".comment-form-text").value = "";

  renderComment(comment, false, false, true);
  checkForCurrentUser();
  attachEventListeners(comment);
  location.reload();
};

submitCommentBtn.addEventListener("click", submitNewComment);

const showCommentLine = (username, newComment = false) => {
  const commentLineEl = document.querySelectorAll(
    `.comment-container[data-user="${username}"][data-reply="true"] .comment-line`
  );

  commentLineEl.forEach((lineEl) => {
    lineEl.style.display = "block";

    if (newComment) lineEl.style.maxWidth = ".2rem";
  });
};

const setLocalStorage = (arr) => {
  localStorage.setItem("comments", JSON.stringify(arr));
};

const getLocalStorage = () => {
  return JSON.parse(localStorage.getItem("comments"));
};

const relativeTime = (timePosted) => {
  let secondsPassed = (currentTime - timePosted) / 1000;
  if (secondsPassed < 0) secondsPassed = 0;

  let minutes = 60;
  let hours = minutes * 60;
  let days = hours * 24;
  let weeks = days * 7;
  let months = days * 30;
  let years = days * 365;

  if (secondsPassed < minutes) return Math.round(secondsPassed) + " s ago";
  if (secondsPassed < hours)
    return Math.round(secondsPassed / minutes) + " min ago";
  if (secondsPassed < days) return Math.round(secondsPassed / hours) + " h ago";
  if (secondsPassed < weeks)
    return (
      Math.round(secondsPassed / days) +
      ` ${Math.round(secondsPassed / days) === 1 ? "day" : "days"} ago`
    );
  if (secondsPassed < months)
    return (
      Math.round(secondsPassed / weeks) +
      ` ${Math.round(secondsPassed / weeks) === 1 ? "week" : "weeks"} ago`
    );
  if (secondsPassed < years)
    return (
      Math.round(secondsPassed / months) +
      ` ${Math.round(secondsPassed / months) === 1 ? "month" : "months"} ago`
    );

  return (
    Math.round(secondsPassed / years) +
    ` ${Math.round(secondsPassed / years) === 1 ? "year" : "years"} ago`
  );
};

const clearLocalStorage = () => {
  localStorage.clear();
};
// clearLocalStorage();
