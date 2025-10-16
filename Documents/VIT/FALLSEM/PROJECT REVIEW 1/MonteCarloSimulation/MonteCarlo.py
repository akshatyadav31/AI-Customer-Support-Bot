import tkinter as tk
from tkinter import ttk, simpledialog, messagebox
import numpy as np
import matplotlib.pyplot as plt

# Common bridge materials and their strength
material_strengths = [
    ("Concrete", "20-50 MPa (compressive strength)"),
    ("Steel", "300-500 MPa (yield strength)"),
    ("Wood", "50-100 MPa (modulus of rupture)"),
    ("Stone", "20-50 MPa (compressive strength)"),
    ("Fiber-reinforced concrete", "50-100 MPa (compressive strength)")
]

# Function to perform Monte Carlo simulation
def run_simulation():
    try:
        # Get values from the input fields
        length_mean = float(length_mean_entry.get())
        length_stddev = float(length_stddev_entry.get() or 0.05 * length_mean)  # Default to 5% of mean if empty
        width_mean = float(width_mean_entry.get())
        width_stddev = float(width_stddev_entry.get() or 0.05 * width_mean)  # Default to 5% of mean if empty
        material_strength_mean = float(material_strength_mean_entry.get())
        material_strength_stddev = float(material_strength_stddev_entry.get() or 0.05 * material_strength_mean)  # Default to 5% of mean if empty
        num_iterations = int(num_iterations_entry.get())

        # Initialize arrays to store results
        failure_count = 0
        failure_loads = []

        # Monte Carlo simulation loop
        for _ in range(num_iterations):
            # Generate random values for bridge parameters
            bridge_length = np.random.normal(length_mean, length_stddev)
            bridge_width = np.random.normal(width_mean, width_stddev)
            material_strength = np.random.normal(material_strength_mean, material_strength_stddev)

            # Generate a random load from a normal distribution (mean=35000, std=5000)
            load_mean = 35000.0
            load_stddev = 5000.0
            load = np.random.normal(load_mean, load_stddev)

            # Calculate the stress on the bridge based on the loads and bridge dimensions
            stress = load / (bridge_length * bridge_width)

            # Check if the stress exceeds the material strength (bridge failure)
            if stress > material_strength:
                failure_count += 1
                failure_loads.append(load)

        # Calculate the probability of failure
        probability_of_failure = failure_count / num_iterations

        # Clear previous results
        results_text.config(state=tk.NORMAL)
        results_text.delete("1.0", tk.END)

        # Display bridge parameters in a table
        for i in range(num_iterations):
            bridge_length = np.random.normal(length_mean, length_stddev)
            bridge_width = np.random.normal(width_mean, width_stddev)
            material_strength = np.random.normal(material_strength_mean, material_strength_stddev)
            table.insert("", "end", values=(i+1, f"{bridge_length:.2f} m", f"{bridge_width:.2f} m", f"{material_strength:.2f} MPa"))

        # Display results
        results_text.insert(tk.END, "Bridge Parameters:\n")
        results_text.insert(tk.END, f"Mean Length: {length_mean} meters, Std. Deviation: {length_stddev} meters\n")
        results_text.insert(tk.END, f"Mean Width: {width_mean} meters, Std. Deviation: {width_stddev} meters\n")
        results_text.insert(tk.END, f"Mean Material Strength [MPa]: {material_strength_mean} MPa, Std. Deviation [MPa]: {material_strength_stddev} MPa\n")
        results_text.insert(tk.END, f"Number of Iterations: {num_iterations}\n")
        results_text.insert(tk.END, f"Number of Failures: {failure_count}\n")
        results_text.insert(tk.END, f"Probability of Failure: {probability_of_failure * 100:.2f}%\n")
        results_text.config(state=tk.DISABLED)# Check if the bridge is safe (probability of failure is zero)


        if probability_of_failure == 0:
            messagebox.showinfo("Bridge Safety", "The bridge is safe!")




        # Plot a histogram of failure loads
        if failure_loads:
            plt.hist(failure_loads, bins=30, edgecolor='k')
            plt.xlabel('Load (Newtons)')
            plt.ylabel('Frequency')
            plt.title('Distribution of Failure Loads')
            plt.show()
    except ValueError as e:
        results_text.config(state=tk.NORMAL)
        results_text.delete("1.0", tk.END)
        results_text.insert(tk.END, f"Error: {str(e)}")
        results_text.config(state=tk.DISABLED)

# Function to calculate the standard deviation
def calculate_standard_deviation():
    try:
        values = simpledialog.askstring("Standard Deviation Calculator", "Enter values separated by commas:")
        if values:
            values_list = [float(val.strip()) for val in values.split(",")]
            if len(values_list) == 1:
                result = np.std(values_list)
                messagebox.showinfo("Standard Deviation", f"The standard deviation of {values} is {result:.2f}")
            else:
                result = np.std(values_list)
                messagebox.showinfo("Standard Deviation", f"The standard deviation of values is {result:.2f}")
    except ValueError as e:
        messagebox.showerror("Error", str(e))


# Function to calculate the mean value
def calculate_mean_value():
    try:
        values = simpledialog.askstring("Mean Value Calculator", "Enter values separated by commas:")
        if values:
            values_list = [float(val.strip()) for val in values.split(",")]
            result = np.mean(values_list)
            messagebox.showinfo("Mean Value", f"The mean value is {result:.2f}")
    except ValueError as e:
        messagebox.showerror("Error", str(e))

# Function to exit the application
def exit_application():
    root.destroy()

# Create a GUI window
root = tk.Tk()
root.title("Bridge Failure Probability Simulation")

# Create and configure input fields
frame = ttk.Frame(root)
frame.grid(column=0, row=0, padx=10, pady=10)

ttk.Label(frame, text="Bridge Length (Mean):").grid(column=0, row=0)
length_mean_entry = ttk.Entry(frame)
length_mean_entry.grid(column=1, row=0)

ttk.Label(frame, text="Bridge Length (Std. Deviation):").grid(column=0, row=1)
length_stddev_entry = ttk.Entry(frame)
length_stddev_entry.grid(column=1, row=1)

ttk.Label(frame, text="Bridge Width (Mean):").grid(column=0, row=2)
width_mean_entry = ttk.Entry(frame)
width_mean_entry.grid(column=1, row=2)

ttk.Label(frame, text="Bridge Width (Std. Deviation):").grid(column=0, row=3)
width_stddev_entry = ttk.Entry(frame)
width_stddev_entry.grid(column=1, row=3)

ttk.Label(frame, text="Material Strength (Mean) [MPa]:").grid(column=0, row=4)
material_strength_mean_entry = ttk.Entry(frame)
material_strength_mean_entry.grid(column=1, row=4)

ttk.Label(frame, text="Material Strength (Std. Deviation) [MPa]:").grid(column=0, row=5)
material_strength_stddev_entry = ttk.Entry(frame)
material_strength_stddev_entry.grid(column=1, row=5)

ttk.Label(frame, text="Number of Iterations:").grid(column=0, row=6)
num_iterations_entry = ttk.Entry(frame)
num_iterations_entry.grid(column=1, row=6)

# Create a "Run Simulation" button
run_button = ttk.Button(frame, text="Run Simulation", command=run_simulation)
run_button.grid(column=0, row=10, columnspan=2)


# Create a "Mean Value Calculator" button
mean_value_button = ttk.Button(frame, text="Mean Value Calculator", command=calculate_mean_value)
mean_value_button.grid(column=0, row=8, columnspan=2)

# Create a "Standard Deviation Calculator" button
std_dev_button = ttk.Button(frame, text="Standard Deviation Calculator", command=calculate_standard_deviation)
std_dev_button.grid(column=0, row=9, columnspan=2)

# Set default values for standard deviation inputs
length_stddev_entry.insert(0, "5")  # Default to 5%
width_stddev_entry.insert(0, "5")  # Default to 5%
material_strength_stddev_entry.insert(0, "5")  # Default to 5%

# Create a text widget for displaying results
results_text = tk.Text(root, wrap=tk.WORD, width=60, height=20)
results_text.grid(column=1, row=0, padx=10, pady=10)
results_text.config(state=tk.DISABLED)

# Create a frame for displaying the material strengths table
material_strength_frame = ttk.Frame(root)
material_strength_frame.grid(column=0, row=1, padx=10, pady=10)

# Create a label for the material strengths table
material_strength_label = ttk.Label(material_strength_frame, text="Common Bridge Materials and Their Strength:")
material_strength_label.grid(column=0, row=0, padx=10, pady=10, sticky=tk.W)

# Create a text widget for displaying material strengths
material_strength_text = tk.Text(material_strength_frame, wrap=tk.WORD, width=40, height=15)
material_strength_text.grid(column=0, row=1, padx=10, pady=5, sticky=tk.W)
material_strength_text.insert(tk.END, "Material\tStrength\n")
for material, strength in material_strengths:
    material_strength_text.insert(tk.END, f"{material}\t{strength}\n")
material_strength_text.config(state=tk.DISABLED)

# Create a frame for displaying the bridge parameters table
parameter_frame = ttk.Frame(root)
parameter_frame.grid(column=1, row=1, padx=10, pady=10)

# Create a label for the bridge parameters table
parameter_label = ttk.Label(parameter_frame, text="Bridge Parameters Table:")
parameter_label.grid(column=0, row=0, padx=10, pady=5, sticky=tk.W)

# Create a treeview widget for displaying bridge parameters
parameter_columns = ("Iteration", "Length (m)", "Width (m)", "Strength (MPa)")
table = ttk.Treeview(parameter_frame, columns=parameter_columns, show="headings")
for col in parameter_columns:
    table.heading(col, text=col)
table.grid(column=0, row=1, padx=10, pady=5, sticky=tk.W)

# Create a frame for the "Exit" button
exit_frame = ttk.Frame(root)
exit_frame.grid(column=0, row=2, columnspan=2, pady=10)

# Create an "Exit" button
exit_button = ttk.Button(exit_frame, text="Exit", command=exit_application)
exit_button.grid(column=0, row=0)

root.mainloop()
