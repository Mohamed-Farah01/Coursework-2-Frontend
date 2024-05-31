var app = new Vue({
  el: "#app" /* el: is where the vue will manage the application */,
  data: {
    /*   data: contains reactive data properties */
    sitename: "courseapp" /* it store the name of the site */,
    cart: [] /* it is an array store Ids of the lessons */,
    showLessons: true /* it is a boolean whether to show lessons or checkout */,
    lessons: [] /* is an array objects containing lessons */,
    search: "",
    sortBy: "subject",
    sortOrderAsc: true,
    user: {
      name: "",
      phone: "",
      isNameValid: false,
      isPhoneValid: false,
    } /* an object to hold user information details */,
    rating: 0,
    baseURL: "https://cw2-kohl.vercel.app/",
  },

  created() {
    this.getLessons();
  },

  computed: {
    /* Allows to define properties on vue instances that are based on other properties */

    // Shopping Cart Functionality 1
    cartDetails() {
      /* retrieves details of the lessons in the cart */
      const uniqueLessonIds = Array.from(new Set(this.cart));
      return uniqueLessonIds.map((lessonId) => {
        const lesson = this.lessons.find((lesson) => lesson.id === lessonId);
        const quantity = this.cartItemCount(lessonId);
        return {
          ...lesson,
          quantity,
          total: quantity * lesson.price,
        };
      });
    },

    cartTotal() {
      /* calculates the total price in the cart */
      return this.cartDetails.reduce((sum, lesson) => sum + lesson.total, 0);
    },
    // End of Shopping Cart Functionality 1
  },
  methods: {
    /*  Are functions defined within a vue components method property */

    async getLessons() {
      var res = await fetch(`${this.baseURL}collection/lessons`);
      this.lessons = await res.json();
    },

    async searchLessons() {
      var query = {
        search: this.search,
        sort: this.sortBy,
        order: this.sortOrderAsc ? "asc" : "desc",
      };

      var res = await fetch(`${this.baseURL}search/collection/lessons`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(query),
      });
      this.lessons = await res.json();
    },

    async submitOrder() {
      var order = {
        cart: [...this.cartDetails],
        username: this.username,
        phone: this.phone,
      };

      // Update lessons
      await this.cartDetails.forEach(async (item) => {
        await fetch(`${this.baseURL}collection/lessons/${item._id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ spaces: item.spaces - item.quantity }),
        });
      });

      // Save Order
      await fetch(`${this.baseURL}collection/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(order),
      });
      alert("Order Submitted");
      window.location.reload();
    },

    // Function to change sort order - ASC or DESC
    toggleSortOrder() {
      this.sortOrderAsc = !this.sortOrderAsc;
      this.searchLessons();
    },

    // Add to Cart Functionality
    addToCart(lesson) {
      if (this.canAddToCart(lesson)) {
        this.cart.push(lesson.id);
      }
    },

    removeFromCart(lesson) {
      const index = this.cart.lastIndexOf(lesson.id);
      if (index > -1) {
        this.cart.splice(index, 1);
      }
    },

    cartItemCount(lessonId) {
      return this.cart.filter((id) => id === lessonId).length;
    },

    canAddToCart(lesson) {
      return lesson.spaces > this.cartItemCount(lesson.id);
    },

    canRemoveFromCart(lesson) {
      return this.cartItemCount(lesson.id) > 0;
    },
    // End of Add to Cart Functionality

    // Shopping Cart Functionality 2
    showCheckout() {
      this.showLessons = this.showLessons ? false : true;
      window.scrollTo(0, 0);
    },

    // Checkout Functionality
    validateUserName() {
      this.user.isNameValid = /^[a-zA-Z]+$/.test(this.user.name);
    },

    validateUserPhone() {
      this.user.isPhoneValid = /^\d+$/.test(this.user.phone);
    },
  },
});
