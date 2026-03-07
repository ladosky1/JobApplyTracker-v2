import mongoose from 'mongoose';

const ROLE_MAP = {
    Technology: [
        "Frontend Developer",
        "Backend Developer",
        "FullStack Developer",
        "Mobile Developer",
        "Intern"
    ],
    Hospitality: [
        "waiter/server",
        "cook/chef",
        "Kitechen Assistant",
        "Cleaner",
        "Supervisor"
    ],
    Retails: [
        "Sales Assistant",
        "Cashier",
        "Store Manager",
        "Stock Assistant"
    ]
}

const jobSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "user"
    },
    company: {
        type: String,
        required: true,
        trim: true,
    },
    roles: {
        type: String,
        required: true,
        validate: {
            validator: function(value) {
                return ROLE_MAP[this.category]?.includes(value);
            },
            message: "Role does not match the selected category"
        }
    },
    category: {
        type: String,
        enum: ['Technology', 'Hospitality', 'Retails'],
        required: true
    },
    status: {
        type: String,
        enum: [ "applied", "interview", "offer","rejected"],
    },
    note: {
        type: String,
        default: '',
    }
},
    {
        timestamps: true
});

const Job = mongoose.model('job', jobSchema);

export default Job;