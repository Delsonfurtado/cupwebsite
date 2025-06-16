document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("myForm");

  if (!form) {
    console.error("Form with ID 'myForm' not found!");
    return;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData(form);

    try {
      const response = await fetch("http://localhost:3000/submit", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        alert(result.message || "Form submitted successfully!");
        form.reset();
      } else {
        alert(result.message || "Submission failed!");
      }
    } catch (error) {
      console.error("Submission failed:", error);
      alert("There was an error submitting the form.");
    }
  });
});
