/**
 * @jest-environment jsdom
 */

import {screen, waitFor} from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills"
import { ROUTES_PATH } from "../constants/routes"
import { localStorageMock } from "../__mocks__/localStorage.js"
import mockStore from "../__mocks__/store"
import router from "../app/Router"
import Bills from "../containers/Bills.js";
import userEvent from "@testing-library/user-event";


describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    beforeEach(()=> {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
    })
    afterEach(()=> document.body.innerHTML = "")

    test("Then bill icon in vertical layout should be highlighted", async () => {
      await waitFor(() => screen.getByTestId('icon-window'))
      const windowIcon = screen.getByTestId('icon-window')
      //to-do write expect expression
      expect(windowIcon.classList.contains('active-icon')).toBe(true)
    })
    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills })
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })
    test("Then when i click on new bill button, a form should appear", async () => {
      new Bills({document, onNavigate, store: mockStore, localStorage: window.localStorage})
      const newBillBtn = await waitFor(() => screen.getByTestId('btn-new-bill'))
      userEvent.click(newBillBtn)
      const billForm = await waitFor(() => screen.getByTestId('form-new-bill'))
      expect(billForm).toBeTruthy()
    })
    test("Then when a click on the icon eye, modal img src should be icon eye data-bill-url", async () => {
      new Bills({
        document, onNavigate, store: mockStore, localStorage: window.localStorage})
      $.fn.modal = jest.fn()
      const iconEye = await waitFor(() => screen.getAllByTestId('icon-eye'))
      userEvent.click(iconEye[0])
      const modalImg = document.querySelector('.modal-body img')
      expect(modalImg.getAttribute('src')).toBe(iconEye[0].getAttribute('data-bill-url'))
    })
  })
})

// test d'intégration GET
jest.mock("../app/store", () => mockStore)
describe("Given I am a user connected as employee", () => {
  beforeEach(()=> {
    Object.defineProperty(window, 'localStorage', { value: localStorageMock })
    window.localStorage.setItem('user', JSON.stringify({
      type: 'Employee',
      email: "a@a"
    }))
    const root = document.createElement("div")
    root.setAttribute("id", "root")
    document.body.append(root)
    router()
  })
  describe("When I navigate to bills page", () => {
    test("fetches bills from mock API GET", async () => {
      window.onNavigate(ROUTES_PATH.Bills)
      await new Promise(process.nextTick);

      const titleContainer  = await screen.getByText("Mes notes de frais")
      expect(titleContainer).toBeTruthy()
      const tbody = await screen.getByTestId("tbody")
      expect(tbody).toBeTruthy()
      expect(tbody.children.length).toBe(4)
    })

    describe("When an error occurs on API", () => {
      beforeEach(() => {jest.spyOn(mockStore, "bills")})
      test("fetches bills from an API and fails with 404 message error", async () => {

        mockStore.bills.mockImplementationOnce(() => {
          return {
            list : () =>  {
              return Promise.reject(new Error("Erreur 404"))
            }
          }})
        window.onNavigate(ROUTES_PATH.Bills)
        await new Promise(process.nextTick);
        const messageContainer = await screen.getByTestId('error-message')
        expect(messageContainer).toBeTruthy()

        const message = await screen.getByText(/Erreur 404/)
        expect(message).toBeTruthy()
      })

      test("fetches messages from an API and fails with 500 message error", async () => {
        mockStore.bills.mockImplementationOnce(() => {
          return {
            list : () =>  {
              return Promise.reject(new Error("Erreur 500"))
            }
          }})

        window.onNavigate(ROUTES_PATH.Bills)
        await new Promise(process.nextTick);
        const message = await screen.getByText(/Erreur 500/)
        expect(message).toBeTruthy()
      })

      test("fetches messages from an API but get corrupted data", async () => {
        mockStore.bills.mockImplementationOnce(() => {
          return {
            list : () =>  {
              return Promise.resolve([{
                "id": "47qAXb6fIm2zOKkLzMro",
                "vat": "80",
                "fileUrl": "https://test.storage.tld/v0/b/billable-677b6.a…f-1.jpg?alt=media&token=c1640e12-a24b-4b11-ae52-529112e9602a",
                "status": "pending",
                "type": "Hôtel et logement",
                "commentary": "séminaire billed",
                "name": "encore",
                "fileName": "preview-facture-free-201801-pdf-1.jpg",
                "date": "fake date",
                "amount": 400,
                "commentAdmin": "ok",
                "email": "a@a",
                "pct": 20
              }])
            }
          }})
        window.onNavigate(ROUTES_PATH.Bills)
        await new Promise(process.nextTick);
        const date = screen.getByText(/fake date/)
        expect(date).toBeTruthy()
      })
    })
  })
})
