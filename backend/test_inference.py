import sys
import os
import time

# Add backend directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from ml.model import load_model, predict_audio

def main():
    # Use a real wav file from the ML workspace for consistency check
    test_wav = r"C:\Users\Shivansh\Desktop\Medos\LungSenseAI-ML\data\raw\ICBHI\101_1b1_Al_sc_Meditron.wav"
    
    if not os.path.exists(test_wav):
        print(f"Error: Could not find test file at {test_wav}")
        print("Please provide a valid WAV file path for testing.")
        return
        
    print(f"Testing inference on: {test_wav}")
    
    t0 = time.time()
    load_model()
    t1 = time.time()
    
    try:
        t2 = time.time()
        result = predict_audio(test_wav)
        t3 = time.time()
        
        print("\n--- INFERENCE SUCCESS ---")
        print(f"Prediction: {result['class_name']}")
        print(f"Confidence: {result['confidence']:.4f}")
        print("\nProbabilities:")
        for cls_name, prob in result['probabilities'].items():
            print(f"  {cls_name}: {prob*100:.2f}%")
            
        print("\n--- TIMING ---")
        print(f"Model Load Time: {t1-t0:.4f}s")
        print(f"Inference Time (including preprocessing): {t3-t2:.4f}s")
        print(f"Total Time: {t3-t0:.4f}s")
        
    except Exception as e:
        print(f"Inference failed: {e}")

if __name__ == "__main__":
    main()
