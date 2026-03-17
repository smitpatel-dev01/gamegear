import User from "../models/User.js";
import Order from "../models/Order.js";

// ─── Update My Profile ────────────────────────────────────────────────────────
export const updateProfile = async (req, res) => {
  const { name, phone } = req.body;

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { name, phone },
    { new: true, runValidators: true }
  );

  res.status(200).json({ message: "Profile updated", user });
};

// ─── Change Password ──────────────────────────────────────────────────────────
export const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user._id).select("+password");

  if (!(await user.matchPassword(currentPassword))) {
    return res.status(400).json({ message: "Current password is incorrect" });
  }

  user.password = newPassword;
  await user.save();

  res.status(200).json({ message: "Password changed successfully" });
};

// ─── Add / Update Address ─────────────────────────────────────────────────────
export const addAddress = async (req, res) => {
  const { label, street, city, state, pincode, country, isDefault } = req.body;

  const user = await User.findById(req.user._id);

  if (isDefault) {
    user.addresses.forEach((addr) => (addr.isDefault = false));
  }

  user.addresses.push({ label, street, city, state, pincode, country, isDefault });
  await user.save();

  res.status(201).json({ message: "Address added", addresses: user.addresses });
};

export const deleteAddress = async (req, res) => {
  const user = await User.findById(req.user._id);
  user.addresses = user.addresses.filter(
    (addr) => addr._id.toString() !== req.params.addressId
  );
  await user.save();
  res.status(200).json({ message: "Address removed", addresses: user.addresses });
};

// ─── Admin: Get All Users ─────────────────────────────────────────────────────
export const getAllUsers = async (req, res) => {
  const { page = 1, limit = 20, search } = req.query;

  const query = {};
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }

  const users = await User.find(query)
    .select("-password")
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));

  const total = await User.countDocuments(query);

  res.status(200).json({ total, page: Number(page), totalPages: Math.ceil(total / limit), users });
};

// ─── Admin: Get Single User ───────────────────────────────────────────────────
export const getUserById = async (req, res) => {
  const user = await User.findById(req.params.id).select("-password");
  if (!user) return res.status(404).json({ message: "User not found" });
  res.status(200).json(user);
};

// ─── Admin: Toggle User Active Status ────────────────────────────────────────
export const toggleUserStatus = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: "User not found" });

  if (user.role === "admin") {
    return res.status(400).json({ message: "Cannot deactivate an admin account" });
  }

  user.isActive = !user.isActive;
  await user.save();

  res.status(200).json({
    message: `User ${user.isActive ? "activated" : "deactivated"} successfully`,
    isActive: user.isActive,
  });
};

// ─── Admin: Delete User ───────────────────────────────────────────────────────
export const deleteUser = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: "User not found" });

  if (user.role === "admin") {
    return res.status(400).json({ message: "Cannot delete an admin account" });
  }

  await user.deleteOne();
  res.status(200).json({ message: "User deleted successfully" });
};

// ─── Admin: Get Dashboard Stats ───────────────────────────────────────────────
export const getDashboardStats = async (req, res) => {
  const [totalUsers, totalOrders, revenueData, recentOrders] = await Promise.all([
    User.countDocuments({ role: "user" }),
    Order.countDocuments(),
    Order.aggregate([
      { $match: { status: { $ne: "Cancelled" } } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]),
    Order.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("user", "name email")
      .populate("items.product", "name"),
  ]);

  res.status(200).json({
    totalUsers,
    totalOrders,
    totalRevenue: revenueData[0]?.total || 0,
    recentOrders,
  });
};
