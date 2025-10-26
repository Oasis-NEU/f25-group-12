function About() {
  return (
    <main className="main-content px-8 py-10 text-gray-800">
      <section className="about-section max-w-3xl mx-auto text-center">
        <h2 className="text-3xl font-bold mb-4 text-blue-600">
          About Maintenance Reporter
        </h2>

        <p className="text-lg mb-6">
          <strong>“Smart Maintenance Starts Before Failure.”</strong>
        </p>

        <p className="text-md mb-4 leading-relaxed">
          Our system uses <span className="font-semibold">AI-driven analytics</span> to
          predict when key assets in buildings owned by our users— such as HVAC units, 
          plumbing systems, and electrical networks — are likely to fail. By predicting 
          maintenance needs before sudden costly damages occur, property managers and 
          residents alike can save time, reduce expenses, and improve reliability across 
          all of their facilities within all of their properties.
        </p>

        <p className="text-md leading-relaxed">
          This platform combines <span className="font-semibold">past maintenance data</span>,
          <span className="font-semibold"> time-series forecasting</span>, along with
          <span className="font-semibold"> anomaly detection</span> to deliver
          insights to not just fix problems, but to prevent them before damage occurs. 
        </p>

        <div className="mt-8 text-sm text-gray-500">
          <p>Developed as part of the <strong>OASIS Fall 2025 Project</strong></p>
        </div>
      </section>
    </main>
  )
}

export default About
