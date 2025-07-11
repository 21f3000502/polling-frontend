// src/KickedPage.jsx
import logo from './assets/react.svg'

export default function KickedPage() {
  return (
    <div className="bg-white min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="flex justify-center mt-10">
          <a
            className="flex items-center gap-2 px-4 py-2 my-2 bg-violet-600 text-white rounded-full shadow hover:bg-violet-700 transition"
            type="button"
            href="/"
          >
            <img src={logo} alt="React logo" className="h-5 w-5" />
            <span>Intervue Poll</span>
          </a>
        </div>

        <h1 className="text-3xl font-semibold mb-2">You’ve been Kicked out !</h1>
        <p className="text-gray-500">
          Looks like the teacher had removed you from the poll system. Please
          <br />
          Try again sometime.
        </p>
        <p className="text-gray-400 mt-8 text-sm">
          Note: Please close this tab and try from another tab.
        </p>
      </div>
    </div>
  );
}
