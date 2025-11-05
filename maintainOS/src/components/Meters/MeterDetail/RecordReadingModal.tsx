import { useState } from "react";
import { X, Camera, ChevronDown } from "lucide-react";
import { meterService } from "../../../store/meters";

// Definiendo una interfaz para el objeto 'selectedMeter' para un mejor tipado
interface Meter {
  id: string; // Se usará para meterId
  measurement: {
    name: string; // p.ej., "Kilometers"
  };
  lastReading?: {
    // Para el placeholder dinámico
    value: number;
  };
}

interface RecordReadingModalProps {
  modalRef: React.RefObject<HTMLDivElement>;
  onClose: () => void;
  selectedMeter: Meter; // Tipo corregido de '() => void' a 'Meter'
  // onConfirm: (readingData: { value: string; date: string }) => void;
  fetchMeters: () => void;
}

export default function RecordReadingModal({
  // onConfirm,
  modalRef,
  onClose,
  selectedMeter,
  fetchMeters,
}: RecordReadingModalProps) {
  const [meterValue, setMeterValue] = useState("");
  const [unit, setUnit] = useState(selectedMeter.measurement.name); // Inicializar con la unidad del medidor
  const [showUnitDropdown, setShowUnitDropdown] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // Estado de carga
  const [error, setError] = useState<string | null>(null); // Estado de error

  const units = ["Kilometers", "Meters", "Miles", "Liters", "Cubic Meters"];

  // Placeholder dinámico
  const lastReadingValue = selectedMeter.lastReading?.value;
  const placeholderText = lastReadingValue
    ? `Last Reading: ${lastReadingValue} ${selectedMeter.measurement.name}`
    : "Enter new reading";

  const handleSubmit = async () => {
    // Validar que los datos necesarios estén presentes
    if (!meterValue || !selectedMeter?.id) {
      setError("Meter value and ID are required.");
      return;
    }

    setIsLoading(true);
    setError(null); // Limpiar errores previos

    // Crear el payload que quieres enviar
    const data = {
      value: parseFloat(meterValue), // Convertir el valor del input (string) a número
      meterId: selectedMeter.id, // Usar el ID del medidor seleccionado
    };

    try {
      const response = await meterService.updateMeterReading(
        selectedMeter.id,
        data
      );

      if (response) {
        fetchMeters();
        console.log("Reading submitted successfully:", data);
        onClose(); // Cerrar el modal si la solicitud fue exitosa
      } else {
        // Manejar respuestas de error del servidor
        const errorData = await response.json();
        console.error("Failed to submit reading:", response.status, errorData);
        setError(
          errorData.message || "Failed to submit reading. Please try again."
        );
      }
    } catch (err) {
      // Manejar errores de red
      console.error("Network error:", err);
      setError(
        "A network error occurred. Please check your connection and try again."
      );
    } finally {
      setIsLoading(false); // Re-habilitar el botón
    }
  };

  return (
    <div
      ref={modalRef}
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
    >
      <div className="bg-white rounded-lg shadow-xl w-130 max-w-xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Meter Reading</h2>
          <button
            onClick={onClose}
            className="text-gray-400 cursor-pointer hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-6 p-4">
          <label className="block text-sm font-semibold text-gray-900 mb-3">
            Submit New Meter Value
          </label>

          <div className="relative flex items-center border-2 border-blue-500 rounded-md overflow-hidden mb-6">
            <input
              type="number"
              placeholder={placeholderText}
              value={meterValue}
              onChange={(e) => setMeterValue(e.target.value)}
              className="flex-1 px-3 py-2 outline-none text-gray-700 placeholder-gray-400"
            />

            {/* Unit Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowUnitDropdown(!showUnitDropdown)}
                className="flex items-center gap-2 px-4 py-3 text-gray-700 hover:bg-gray-50 border-l border-gray-300"
              >
                {unit} {/* Mostrar la unidad seleccionada del estado */}
                <ChevronDown size={16} className="text-gray-500" />
              </button>

              {showUnitDropdown && (
                <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                  {units.map((u) => (
                    <button
                      key={u}
                      onClick={() => {
                        setUnit(u); // Actualizar la unidad seleccionada
                        setShowUnitDropdown(false);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm text-gray-700"
                    >
                      {u}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Add Pictures/Files */}
          <div className="border-2 border-dashed border-orange-600 rounded-md p-6 flex flex-col items-center justify-center bg-blue-50/30">
            {" "}
            {/* Corregido bg-opacity */}
            <div className="mb-3">
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                <Camera size={24} className="text-white" />{" "}
                {/* Cambiado a blanco para contraste */}
              </div>
            </div>
            <button className="text-orange-600 font-medium text-sm">
              Add Pictures/Files
            </button>
          </div>

          {/* Mensaje de Error */}
          {error && <p className="text-red-600 text-sm mt-4">{error}</p>}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2 cursor-pointer text-orange-600 font-medium transition-colors"
            disabled={isLoading} // Deshabilitar mientras carga
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-6 py-2 bg-orange-600 cursor-pointer text-black rounded-md hover:bg-gray-400 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!meterValue || isLoading} // Deshabilitar si no hay valor o si está cargando
          >
            {isLoading ? "Submitting..." : "Submit"}
          </button>
        </div>
      </div>
    </div>
  );
}
