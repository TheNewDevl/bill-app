import { ROUTES_PATH } from "../constants/routes.js";
export let PREVIOUS_LOCATION = "";

// we use a class so as to test its methods in e2e tests
export default class Login {
  constructor({ document, localStorage, onNavigate, PREVIOUS_LOCATION, store }) {
    this.document = document;
    this.localStorage = localStorage;
    this.onNavigate = onNavigate;
    this.PREVIOUS_LOCATION = PREVIOUS_LOCATION;
    this.store = store;
    const formEmployee = this.document.querySelector(`form[data-testid="form-employee"]`);
    formEmployee.addEventListener("submit", this.handleSubmitEmployee);
    const formAdmin = this.document.querySelector(`form[data-testid="form-admin"]`);
    formAdmin.addEventListener("submit", this.handleSubmitAdmin);
  }
  handleSubmitEmployee = (e) => {
    e.preventDefault();
    const user = {
      type: "Employee",
      email: e.target.querySelector(`input[data-testid="employee-email-input"]`).value,
      password: e.target.querySelector(`input[data-testid="employee-password-input"]`).value,
      status: "connected",
    };
    this.localStorage.setItem("user", JSON.stringify(user));
    this.login(user, e).catch((err) => {
      console.error(err);
      this.createUser(user, e);
    });
  };

  handleSubmitAdmin = (e) => {
    e.preventDefault();
    const user = {
      type: "Admin",
      email: e.target.querySelector(`input[data-testid="admin-email-input"]`).value,
      password: e.target.querySelector(`input[data-testid="admin-password-input"]`).value,
      status: "connected",
    };
    this.localStorage.setItem("user", JSON.stringify(user));
    this.login(user, e).catch((err) => {
      console.error(err);
      this.createUser(user, e);
    });
  };

  // not need to cover this function by tests
  login = (user, e) => {
    if (this.store) {
      return this.store
        .login(
          JSON.stringify({
            email: user.email,
            password: user.password,
          })
        )
        .then(({ jwt }) => {
          this.removeError(e);
          this.localStorage.setItem("jwt", jwt);
          const title = e.target.firstElementChild.textContent;
          this.onNavigate(ROUTES_PATH[title === "Employé" ? "Bills" : "Dashboard"]);
          this.PREVIOUS_LOCATION = ROUTES_PATH[title === "Employé" ? "Bills" : "Dashboard"];
          PREVIOUS_LOCATION = this.PREVIOUS_LOCATION;
          document.body.style.backgroundColor = "#fff";
        });
    } else {
      return null;
    }
  };

  /** @param e{SubmitEvent} to get target
   *  @param error{string} error to display
   */
  setError = (e, error) => {
    const existingError = e.target.querySelector(".login-error");
    if (!existingError) {
      const p = document.createElement("p");
      p.textContent = error;
      p.className = "login-error";
      p.setAttribute("data-testid", "login-error");
      e.target.append(p);
    }
  };

  /** @param e{SubmitEvent} to get target */
  removeError = (e) => {
    const existingError = e.target.querySelector(".login-error");
    if (existingError) {
      existingError.remove();
    }
  };

  // not need to cover this function by tests
  createUser = (user, e) => {
    if (this.store) {
      return this.store
        .users()
        .create({
          data: JSON.stringify({
            type: user.type,
            name: user.email.split("@")[0],
            email: user.email,
            password: user.password,
          }),
        })
        .then(() => {
          console.log(`User with ${user.email} is created`);
          return this.login(user, e);
        })
        .catch((err) => {
          console.error(err);
          this.setError(e, err);
        });
    } else {
      return null;
    }
  };
}
