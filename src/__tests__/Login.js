/**
 * @jest-environment jsdom
 */

import LoginUI from "../views/LoginUI";
import Login from "../containers/Login.js";
import { ROUTES } from "../constants/routes";
import { fireEvent, screen, waitFor } from "@testing-library/dom";
import {localStorageMock} from "../__mocks__/localStorage.js";


describe("Given that I am a user on login page", () => {
  describe("When I do not fill fields and I click on employee button Login In", () => {
    test("Then It should renders Login page", () => {
      document.body.innerHTML = LoginUI();

      const inputEmailUser = screen.getByTestId("employee-email-input");
      expect(inputEmailUser.value).toBe("");

      const inputPasswordUser = screen.getByTestId("employee-password-input");
      expect(inputPasswordUser.value).toBe("");

      const form = screen.getByTestId("form-employee");
      const handleSubmit = jest.fn((e) => e.preventDefault());

      form.addEventListener("submit", handleSubmit);
      fireEvent.submit(form);
      expect(screen.getByTestId("form-employee")).toBeTruthy();
    });
  });

  describe("When I do fill fields in incorrect format and I click on employee button Login In", () => {
    test("Then It should renders Login page", () => {
      document.body.innerHTML = LoginUI();

      const inputEmailUser = screen.getByTestId("employee-email-input");
      fireEvent.change(inputEmailUser, { target: { value: "pasunemail" } });
      expect(inputEmailUser.value).toBe("pasunemail");

      const inputPasswordUser = screen.getByTestId("employee-password-input");
      fireEvent.change(inputPasswordUser, { target: { value: "azerty" } });
      expect(inputPasswordUser.value).toBe("azerty");

      const form = screen.getByTestId("form-employee");
      const handleSubmit = jest.fn((e) => e.preventDefault());

      form.addEventListener("submit", handleSubmit);
      fireEvent.submit(form);
      expect(screen.getByTestId("form-employee")).toBeTruthy();
    });
  });

  describe("When I do fill fields in correct format and I click on employee button Login In", () => {
    test("Then I should be identified as an Employee in app", () => {
      document.body.innerHTML = LoginUI();
      const inputData = {
        email: "johndoe@email.com",
        password: "azerty",
      };

      const inputEmailUser = screen.getByTestId("employee-email-input");
      fireEvent.change(inputEmailUser, { target: { value: inputData.email } });
      expect(inputEmailUser.value).toBe(inputData.email);

      const inputPasswordUser = screen.getByTestId("employee-password-input");
      fireEvent.change(inputPasswordUser, {
        target: { value: inputData.password },
      });
      expect(inputPasswordUser.value).toBe(inputData.password);

      const form = screen.getByTestId("form-employee");

      // localStorage should be populated with form data
      Object.defineProperty(window, "localStorage", {
        value: {
          getItem: jest.fn(() => null),
          setItem: jest.fn(() => null),
        },
        writable: true,
      });

      // we have to mock navigation to test it
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };

      let PREVIOUS_LOCATION = "";

      const store = jest.fn();

      const login = new Login({
        document,
        localStorage: window.localStorage,
        onNavigate,
        PREVIOUS_LOCATION,
        store,
      });

      const handleSubmit = jest.fn((e) => login.handleSubmitEmployee(e));
      login.login = jest.fn().mockResolvedValue({});
      form.addEventListener("submit", handleSubmit);
      fireEvent.submit(form);
      expect(handleSubmit).toHaveBeenCalled();
      expect(window.localStorage.setItem).toHaveBeenCalled();
      expect(window.localStorage.setItem).toHaveBeenCalledWith(
        "user",
        JSON.stringify({
          type: "Employee",
          email: inputData.email,
          password: inputData.password,
          status: "connected",
        })
      );
    });
  });
});

describe("Given that I am a user on login page", () => {
  describe("When I do not fill fields and I click on admin button Login In", () => {
    test("Then It should renders Login page", () => {
      document.body.innerHTML = LoginUI();

      const inputEmailUser = screen.getByTestId("admin-email-input");
      expect(inputEmailUser.value).toBe("");

      const inputPasswordUser = screen.getByTestId("admin-password-input");
      expect(inputPasswordUser.value).toBe("");

      const form = screen.getByTestId("form-admin");
      const handleSubmit = jest.fn((e) => e.preventDefault());

      form.addEventListener("submit", handleSubmit);
      fireEvent.submit(form);
      expect(screen.getByTestId("form-admin")).toBeTruthy();
    });
  });

  describe("When I do fill fields in incorrect format and I click on admin button Login In", () => {
    test("Then it should renders Login page", () => {
      document.body.innerHTML = LoginUI();

      const inputEmailUser = screen.getByTestId("admin-email-input");
      fireEvent.change(inputEmailUser, { target: { value: "pasunemail" } });
      expect(inputEmailUser.value).toBe("pasunemail");

      const inputPasswordUser = screen.getByTestId("admin-password-input");
      fireEvent.change(inputPasswordUser, { target: { value: "azerty" } });
      expect(inputPasswordUser.value).toBe("azerty");

      const form = screen.getByTestId("form-admin");
      const handleSubmit = jest.fn((e) => e.preventDefault());

      form.addEventListener("submit", handleSubmit);
      fireEvent.submit(form);
      expect(screen.getByTestId("form-admin")).toBeTruthy();
    });
  });

  describe("When I do fill fields in correct format and I click on admin button Login In", () => {
    test("Then I should be identified as an HR admin in app", () => {
      document.body.innerHTML = LoginUI();
      const inputData = {
        type: "Admin",
        email: "johndoe@email.com",
        password: "azerty",
        status: "connected",
      };

      const inputEmailUser = screen.getByTestId("admin-email-input");
      fireEvent.change(inputEmailUser, { target: { value: inputData.email } });
      expect(inputEmailUser.value).toBe(inputData.email);

      const inputPasswordUser = screen.getByTestId("admin-password-input");
      fireEvent.change(inputPasswordUser, {
        target: { value: inputData.password },
      });
      expect(inputPasswordUser.value).toBe(inputData.password);

      const form = screen.getByTestId("form-admin");

      // localStorage should be populated with form data
      Object.defineProperty(window, "localStorage", {
        value: {
          getItem: jest.fn(() => null),
          setItem: jest.fn(() => null),
        },
        writable: true,
      });

      // we have to mock navigation to test it
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };

      let PREVIOUS_LOCATION = "";

      const store = jest.fn();

      const login = new Login({
        document,
        localStorage: window.localStorage,
        onNavigate,
        PREVIOUS_LOCATION,
        store,
      });

      const handleSubmit = jest.fn(login.handleSubmitAdmin);
      login.login = jest.fn().mockResolvedValue({});
      form.addEventListener("submit", handleSubmit);
      fireEvent.submit(form);
      expect(handleSubmit).toHaveBeenCalled();
      expect(window.localStorage.setItem).toHaveBeenCalled();
      expect(window.localStorage.setItem).toHaveBeenCalledWith(
        "user",
        JSON.stringify({
          type: "Admin",
          email: inputData.email,
          password: inputData.password,
          status: "connected",
        })
      );
    });
  });
});

describe('Given I am on Login Page', function () {
  const createError = "erreur create"
  const loginError = "erreur login"
  const jwt = "eognqoeugh23G?4I.EZIGJIJG.zjegij"
  beforeEach(async ()=> {
    const mockLoginStore = {
      mailList: ["e@a"],
      login: jest.fn().mockImplementation((user) => {
        const parsedUser = JSON.parse(user)
        if (mockLoginStore.mailList.includes(parsedUser.email) && parsedUser.password.length > 3) {
          return Promise.resolve({jwt})
        } else {
          return Promise.reject(loginError);
        }
      }),
      users: jest.fn().mockImplementation(()=> {
        return {
          create: jest.fn().mockImplementation((user) => {
            const mail = JSON.parse(user.data).email
            if(!mockLoginStore.mailList.includes(mail)){
              mockLoginStore.mailList.push(mail)
              return Promise.resolve()
            } else {
              return Promise.reject(createError);
            }
          }),
        }
      })
    }
    jest.mock("../app/store", () => mockLoginStore)
    document.body.innerHTML = LoginUI();
    const onNavigate = (pathname) => {
      document.body.innerHTML = ROUTES({ pathname })
    }
    let PREVIOUS_LOCATION = ""
    new Login({
      document, localStorage: localStorageMock, onNavigate, PREVIOUS_LOCATION, store: mockLoginStore
    })
    Object.defineProperty(window, 'localStorage', { value: localStorageMock })
  })
  afterEach(()=> {
    jest.resetAllMocks()
    jest.resetModules()
    document.body.innerHTML = ""
    localStorageMock.clear()
  })

  describe('When I submit a valid login form as an Employee',  function () {
    test('Then I should be redirect to Bills page and jwt should be stored in localstorage', async function () {
      const form = screen.getByTestId('form-employee')
      const emailInput = screen.getByTestId('employee-email-input')
      emailInput.value = "e@a"
      const passwordInput = screen.getByTestId('employee-password-input')
      passwordInput.value = "password"
      fireEvent.submit(form)

      const billedPageTitle = await waitFor(() => screen.getByText(/mes notes de frais/i))
      expect(billedPageTitle).toBeTruthy()
      expect(localStorageMock.getItem('jwt')).toContain(jwt)
    });
  });
  describe('When I submit and my email is not in database',  function () {
    test('Then it should call create store method and redirect to bills page', async function () {
      const form = screen.getByTestId('form-employee')
      const emailInput = screen.getByTestId('employee-email-input')
      emailInput.value = "newEmal@test"
      const passwordInput = screen.getByTestId('employee-password-input')
      passwordInput.value = "password"
      fireEvent.submit(form)
      const billedPageTitle = await waitFor(() => screen.getByText(/mes notes de frais/i))
      expect(billedPageTitle).toBeTruthy()
    });
  });
  describe('When I submit a invalid login form as an Employee',  function () {
    test('Then I should stay on login page', async function () {
      const spyConsole = jest.spyOn(console, 'error').mockImplementation(()=>{})
      const form = screen.getByTestId('form-employee')
      const emailInput = screen.getByTestId('employee-email-input')
      emailInput.value = "e@a"
      const passwordInput = screen.getByTestId('employee-password-input')
      passwordInput.value = ""
      fireEvent.submit(form)

      const form2 =  await waitFor(() => screen.getByTestId("form-employee"))
      expect(form2).toBeTruthy()

      const error =  await waitFor(() => screen.getByText(/erreur create/i))
      expect(error).toBeTruthy()
      expect(spyConsole).toHaveBeenCalledWith(createError)
      fireEvent.submit(form)
    });
    test('It should remove error', async function () {
      const spyConsole = jest.spyOn(console, 'error').mockImplementation(()=>{})
      const form = screen.getByTestId('form-employee')
      const emailInput = screen.getByTestId('employee-email-input')
      emailInput.value = "e@a"
      const passwordInput = screen.getByTestId('employee-password-input')
      passwordInput.value = ""
      fireEvent.submit(form)

      const error =  await waitFor(() => screen.getByTestId(/login-error/i))
      expect(error).toBeTruthy()

      emailInput.value = "e@a"
      passwordInput.value = "password"
      fireEvent.submit(form)

      await new Promise((e) => setTimeout(e, 100));
      const error2 =  screen.queryByTestId(/login-error/i)
      expect(error2).toBeNull()
      expect(spyConsole).toHaveBeenCalledTimes(1)
    });
  });

  describe('When Login class is init without a valid store',  function () {
    test('Then login method should return null', async function () {
      const onNavigate = () => {}
      const login = new Login({
        document, localStorage: localStorageMock, onNavigate, PREVIOUS_LOCATION : "", store: null
      })
      expect(login.login({})).toBe(null)
    });
    test('Then create method should return null', async function () {
      const onNavigate = () => {}
      const login = new Login({
        document, localStorage: localStorageMock, onNavigate, PREVIOUS_LOCATION : "", store: null
      })
      expect(login.createUser({})).toBe(null)
    });
  });

  //ADMIN
  describe('When I submit a valid login form as an Admin', function () {
    test('Then I should be redirect to Bills page and jwt should be stored in localstorage', async function () {
      const form = screen.getByTestId('form-admin')
      const emailInput = screen.getByTestId('admin-email-input')
      emailInput.value = "e@a"
      const passwordInput = screen.getByTestId('admin-password-input')
      passwordInput.value = "password"
      fireEvent.submit(form)

      const status1 = await waitFor(() => screen.getByText(/en attente/i))
      const status2 = await waitFor(() => screen.getByText(/validé/i))
      const status3 = await waitFor(() => screen.getByText(/refusé/i))
      expect(status1).toBeTruthy()
      expect(status2).toBeTruthy()
      expect(status3).toBeTruthy()
      expect(localStorageMock.getItem('jwt')).toContain(jwt)
    });
  });
  describe('When I submit a invalid login form as an Admin',   function () {
    test('Then I should stay on login page', async function () {
      const spyConsole = jest.spyOn(console, 'error').mockImplementation(()=>{})
      const form = screen.getByTestId('form-admin')
      const emailInput = screen.getByTestId('admin-email-input')
      emailInput.value = "e@a"
      const passwordInput = screen.getByTestId('admin-password-input')
      passwordInput.value = ""
      fireEvent.submit(form)

      const form2 =  await waitFor(() => screen.getByTestId("form-admin"))
      expect(form2).toBeTruthy()

      const error =  await waitFor(() => screen.getByText(/erreur create/i))
      expect(error).toBeTruthy()

      expect(spyConsole).toHaveBeenCalledWith(createError)
    });

  });

});