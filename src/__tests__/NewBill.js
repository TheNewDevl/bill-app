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
      test( 'Bills store should not be updated', function () {
        const input = screen.getByTestId('file')
        userEvent.upload(input, invalidFile)
        expect(mockStore.bills().list().length).toBe(4)
      });
    });

  })
})
