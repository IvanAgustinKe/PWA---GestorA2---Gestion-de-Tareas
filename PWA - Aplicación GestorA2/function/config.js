document.addEventListener("DOMContentLoaded", () => {
  const configButton = document.getElementById("menu-config");
  const configDialog = document.getElementById("config-dialog");
  const configForm = document.getElementById("config-form");
  const voiceSelect = document.getElementById("voice-select");
  const saveConfigButton = document.getElementById("save-config");
  const cancelConfigButton = document.getElementById("cancel-config");

  if (
    typeof HTMLDialogElement === "undefined" ||
    !("showModal" in configDialog)
  ) {
    dialogPolyfill.registerDialog(configDialog);
  }

  function populateVoiceList() {
    const synth = window.speechSynthesis;
    const voices = synth.getVoices();

    voices.forEach((voice) => {
      const option = document.createElement("option");
      option.value = voice.name;
      option.textContent = `${voice.name} (${voice.lang})`;
      voiceSelect.appendChild(option);
    });
  }

  if (speechSynthesis.onvoiceschanged !== undefined) {
    speechSynthesis.onvoiceschanged = populateVoiceList;
  }

  configButton.addEventListener("click", () => {
    const savedConfig = JSON.parse(localStorage.getItem("speechConfig")) || {
      speed: 1,
    };
    voiceSelect.value = savedConfig.voice || "";
    document.getElementById("speed-range").value = savedConfig.speed || 1;
    configDialog.showModal();
  });

  cancelConfigButton.addEventListener("click", () => {
    configDialog.close();
  });

  configForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const selectedVoice = voiceSelect.value;
    const speed = parseFloat(document.getElementById("speed-range").value);

    const speechConfig = {
      voice: selectedVoice,
      speed: speed,
    };

    localStorage.setItem("speechConfig", JSON.stringify(speechConfig));

    configDialog.close();
  });
});
