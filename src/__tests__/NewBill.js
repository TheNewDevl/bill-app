/**
 * @jest-environment jsdom
 */

import mockStore from "../__mocks__/store.js";
import {fireEvent, screen, waitFor} from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import {localStorageMock} from '../__mocks__/localStorage.js'
import {ROUTES, ROUTES_PATH} from "../constants/routes.js";
import userEvent from "@testing-library/user-event";
import router from "../app/Router.js";

/**
 * Prepare form for submit filling inputs et uploading a file
 * @return {Promise<{fileName: string, inputValues}>}
 */
export const prepareNewBillForm = async () => {
  const inputsValues = {
    "expense-type": "Transports",
    "expense-name": "Dépense test",
    "amount": "500",
    "datepicker": "2022-11-11",
    "vat": "10",
    "commentary": "Commentaire test"
    }
    for (const [key, value] of Object.entries(inputsValues)) {
      document.querySelector(`[data-testid="${key}"]`).value = value
    }
  const file = document.querySelector('[data-testid="file"]')
  const fileName = "valid-file"
  await userEvent.upload(file, new File(["file"], fileName, {type: "image/png"}))
  return { fileName, inputsValues }
}

describe("Given I am connected as an employee", () => {
  let mockStore
  beforeEach(async () => {
    const {default: mock} = await import('../__mocks__/store.js')
    mockStore = mock
    document.body.innerHTML = NewBillUI()
    window.localStorage.setItem('user', JSON.stringify({
      type: 'Employee',
      email: "a@a"
    }))
    const onNavigate = (pathname) => {
      document.body.innerHTML = ROUTES({ pathname })
    }
    new NewBill({
      document, onNavigate, store: mockStore, localStorageMock })
  })
  afterEach(() => {
    //Clean env
    document.body.innerHTML = ""
    jest.resetAllMocks()
    jest.resetModules()
  })

  describe("When I am on NewBill Page", () => {
    test("Then a form and a title should be displayed", async () => {
      const form = screen.getByTestId("form-new-bill")
      expect(form).toBeTruthy()
      const title = screen.getByText(/envoyer une note de frais/i)
      expect(title).toBeTruthy()
    })

    describe('when I upload an invalid file', function () {
      let input
      //Spy alert
      let spyAlert = jest.spyOn(window, 'alert').mockImplementation(()=>{})
      beforeEach(() => {
        //Create a mock file and upload it
        const invalidFile = new File(["file"], "invalid-file", {
          type: "application/pdf"
        });
        input = screen.getByTestId('file')
        userEvent.upload(input, invalidFile)
      })

      test('An alert should fire', function () {
        const fileError = "Seul les fichiers png, jpg et jpg sont acceptés"
        expect(spyAlert).toHaveBeenCalledWith(fileError)
      });
      test( 'Input files and value should be empty', function () {
        expect(input.files.length).toBe(0)
        expect(input.value).toBe("")
      });
      test( 'Bills store should not be updated',  function () {
        mockStore.bills().list().then(
            bills => expect(bills.length).toBe(4)
          )
      });
    });

    describe('when I upload a valid file', function () {
      test( 'Input files length should be 1', function () {
        //Create a mock file and upload it
        const input = screen.getByTestId('file')
        const validFile = new File(["file"], "valid-file", {type: "image/png"});
        userEvent.upload(input, validFile)
        expect(input.files.length).toBe(1)
        expect(input.files[0].name).toBe('valid-file')
      });
      test( 'Bill should not be created a this moment', function () {
        mockStore.bills().list().then(
            bills => expect(bills.length).toBe(4)
          )
      });
    });

    describe('When I submit the form', function () {
      test('Should create a new bill with the inputs values', async function () {
        //Prepare form submit
        const form = document.querySelector('[data-testid="form-new-bill"]')
        const mail = JSON.parse(localStorage.getItem("user")).email
        const {fileName, inputsValues} = await prepareNewBillForm()
        //Store bills length before fire submit event to compare
        let initialBillsLength
        await mockStore.bills().list().then(bills => initialBillsLength = bills.length).then(() => fireEvent.submit(form))
        await mockStore.bills().list().then(bills => {
          expect(bills[bills.length - 1]).toEqual({
            "amount": inputsValues["amount"],
            "commentary": inputsValues["commentary"],
            "date": inputsValues["datepicker"],
            "email": mail,
            "fileName": fileName,
            "id": "100",
            "name": inputsValues["expense-name"],
            "status": "pending",
            "type": inputsValues["expense-type"],
            "vat": inputsValues["vat"]}
          )
          expect(bills.length).toEqual(initialBillsLength + 1)})
      });

      test( 'if error, should log error', async function () {
        //Spy console error
        const logSpy = jest.spyOn(console, 'error').mockImplementation(()=>{})
        const error = "une erreur est survenue"
        //Mock create bills method
        jest.spyOn(mockStore, "bills").mockImplementationOnce(() => {
           return {
             create : () => Promise.reject(error)
         }})
        //submit form
        const form = screen.getByTestId('form-new-bill')
        await fireEvent.submit(form)
        await logSpy

       expect(logSpy).toHaveBeenCalledTimes(1)
       expect(logSpy).toHaveBeenCalledWith(error)
     });
    });
  })
})

// Test d'intégration POST API
jest.mock("../app/store", () => mockStore)

describe("Given I am a user connected as employee", () => {
  beforeEach(async ()=> {
    await Object.defineProperty(window, 'localStorage', { value: localStorageMock })
    await window.localStorage.setItem('user', JSON.stringify({
      type: 'Employee',
      email: "a@a"
    }))
    const root = document.createElement("div")
    root.setAttribute("id", "root")
    document.body.append(root)
    router()
  })
  afterEach(() => {
    document.body.innerHTML = ""
    jest.resetAllMocks()
  })

  describe("When I submit a new bill", () => {
    test("Post data to the mock API", async () => {
      //Navigate to New bill page
      window.onNavigate(ROUTES_PATH.NewBill)
      await new Promise(process.nextTick);

      //fill form and file
      const {inputsValues} = await prepareNewBillForm()

      //Submit form
      const btn = document.querySelector('#btn-send-bill')

      //Check if there is one more item in bills list and click on submit button
      let initialBillsLength
      await mockStore.bills().list().then(bills => initialBillsLength = bills.length).then(() => userEvent.click(btn))
      await mockStore.bills().list().then(bills => expect(bills.length).toBe(initialBillsLength + 1))

      //Check navigation to Bills page
      const billsPageTitle = await waitFor(() => screen.getByText(/mes notes de frais/i))
      expect(billsPageTitle).toBeTruthy()

      //Check the display of the added bill
      const billName = await waitFor(() => screen.getByText(inputsValues["expense-name"]))
      expect(billName).toBeTruthy()
    })

    describe("When an error occurs on API", () => {
      beforeEach(() => {jest.spyOn(mockStore, "bills")})

      test("fetches bills from an API and fails with 404 message error", async () => {
        const error = "Une erreur est survenue"
        //Mock create implementation
        mockStore.bills.mockImplementation(() => {
          return {
            create : () =>  {
              return Promise.reject(new Error(error))
            }
          }})

        //Navigate to New bill page
        window.onNavigate(ROUTES_PATH.NewBill)
        await new Promise(process.nextTick);

        //Fill form and file
        await prepareNewBillForm()

        //Spy console error
        const logSpy = jest.spyOn(console, 'error').mockImplementationOnce(()=>{})

        //Subit form
        const btn = document.querySelector('#btn-send-bill')
        await userEvent.click(btn)

        //Test that we stay in new bill page
        const billsPageTitle = await waitFor(() => screen.getByText(/envoyer une note de frais/i))
        expect(billsPageTitle).toBeTruthy()

        //Test console error call
        expect(logSpy).toHaveBeenCalledWith(new Error(error))
      })
    })
  })
})
