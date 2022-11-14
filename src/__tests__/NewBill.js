/**
 * @jest-environment jsdom
 */

import {screen} from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import mockStore from '../__mocks__/store.js'
import {localStorageMock} from '../__mocks__/localStorage.js'
import {ROUTES} from "../constants/routes.js";
import userEvent from "@testing-library/user-event";

describe("Given I am connected as an employee", () => {
  beforeEach(() => {
    document.body.innerHTML = NewBillUI()
    window.localStorage.setItem('user', JSON.stringify({
      type: 'Employee',
      email: "a@a"
    }))
  })
  afterEach(() => document.body.innerHTML = "")

  describe("When I am on NewBill Page", () => {
    test("Then a form and a title should be displayed", async () => {
      const form = screen.getByTestId("form-new-bill")
      expect(form).toBeTruthy()
      const title = screen.getByText(/envoyer une note de frais/i)
      expect(title).toBeTruthy()
    })

    describe('when I upload an invalid file', function () {
      const invalidFile = new File(["file"], "invalid-file", {
        type: "application/pdf"
      });
      const fileError = "Seul les fichiers png, jpg et jpg sont acceptés"
      const spyAlert = jest.spyOn(window, 'alert').mockImplementation(()=>{})
      beforeEach(() => {
        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname })
        }
        new NewBill({
          document, onNavigate, store: mockStore, localStorageMock })
      })
      test('An alert should fire', function () {
        const input = screen.getByTestId('file')
        userEvent.upload(input, invalidFile)
        expect(spyAlert).toHaveBeenCalledWith(fileError)
      });

      test( 'Input files and value should be empty', function () {
        const input = screen.getByTestId('file')
        userEvent.upload(input, invalidFile)
        expect(input.files.length).toBe(0)
        expect(input.value).toBe("")
      });
      test( 'Bills store should not be updated',  function () {
        const input = screen.getByTestId('file')
        userEvent.upload(input, invalidFile)
        mockStore.bills().list().then(
            bills => expect(bills.length).toBe(4)
          )
      });
    });

    describe('when I upload a valid file', function () {
      const validFile = new File(["file"], "valid-file", {
        type: "image/png"
      });
      beforeEach(() => {
        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname })
        }
        new NewBill({
          document, onNavigate, store: mockStore, localStorageMock })
      })

      test( 'Input files length should be 1', function () {
        const input = screen.getByTestId('file')
        userEvent.upload(input, validFile)
        expect(input.files.length).toBe(1)
      });
      test( 'Bills store should have one more item', function () {
        mockStore.bills().list().then(
            bills => expect(bills.length).toBe(5)
          )
      });
      test( 'if error, should log error', async function () {
        const logSpy = jest.spyOn(console, 'error').mockImplementation(()=>{})
        const error = "une erreur est survenue"
        jest.spyOn(mockStore, "bills").mockImplementationOnce(() => {
            return {
              create : () => Promise.reject(error)
          }})
        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname })
        }
        new NewBill({
          document, onNavigate, store: mockStore, localStorageMock })
        const input = screen.getByTestId('file')
        await userEvent.upload(input, validFile)
        await logSpy

        expect(logSpy).toHaveBeenCalledTimes(1)
        expect(logSpy).toHaveBeenCalledWith(error)
      });
    });

  })
})
