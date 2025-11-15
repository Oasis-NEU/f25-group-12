import * as db from '../services/database.js'

export async function getAllUsers(req, res) {
  try {
    const users = await db.getAllUsers()
    res.json(users)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const requester = req.user;

    // Only admins or the corresponding user can view
    if (requester.role !== 'admin' && requester.user_id.toString() !== id) {
      return res.status(403).json({ error: 'Forbidden: cannot access other users' });
    }

    const { data, error } = await supabase
      .from('Users')
      .select('user_id, full_name, email, role, phone, industry_id')
      .eq('user_id', id)
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
}

export async function createUser(req, res) {
  try {
    const newUser = await db.createUser(req.body)
    res.status(201).json(newUser)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const requester = req.user;

    // Only admin or corresponding user can update
    if (requester.role !== 'admin' && requester.user_id.toString() !== id) {
      return res.status(403).json({ error: 'Forbidden: cannot update other users' });
    }

    const updates = { ...req.body };
    if (updates.password) {
      const salt = bcrypt.genSaltSync(10);
      updates.password_hash = bcrypt.hashSync(updates.password, salt);
      delete updates.password;
    }

    const { data, error } = await supabase
      .from('Users')
      .update(updates)
      .eq('user_id', id)
      .select();

    if (error) throw error;
    res.json({ message: 'User updated', user: data[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function deleteUser(req, res) {
  try {
    await db.deleteUser(req.params.id)
    res.status(204).send()
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}
