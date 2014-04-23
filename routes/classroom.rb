class Gamification < Sinatra::Application

  # Get all classrooms
  #
  # return [Array] classroom objects
  get '/classroom' do
    if authorized?
      content_type :json
      @classroom = Classroom.all()
      status 200
      return @classroom.to_json(:only => [ :_id, :label ])
    else
      status 401
    end
  end

  # Get a classroom by id
  #
  # param [String] the classroom id
  #
  # return [Object] classroom
  get '/classroom/:id' do
    if authorized?
      content_type :json
      classroom = Classroom.find(params[:id])
      status 200
      return classroom.to_json
    else
      status 401
    end
  end

  # Create a new classroom
  #
  # return [Object] classroom
  post '/classroom' do
    if authorized?
      request.body.rewind  # in case someone already read it
      content_type :json

      classroom = Classroom.create()
      status 200
      return  classroom.to_json
    else
      status 401
    end
  end

  # Update a classroom by id
  #
  # param [String] the classroom id
  #
  # body [Object] in JSON. ex: {"label":"<String>" }
  #
  # return [Object] classroom
  put '/classroom/:id' do
    if authorized?
      request.body.rewind  # in case someone already read it
      content_type :json

      classroom = Classroom.find(params[:id])

      if classroom then
        data = JSON.parse request.body.read

        unless data['label'].nil?
          classroom.update_attributes(:label => data['label'])
          classroom.save
        end

        status 200

        return  classroom.to_json
      else
        return {"error" => "Classroom "+params[:id]+" not found"}.to_json
      end
    else
      status 401
    end
  end

  # Add a group to a classroom by id
  #
  # param [String] the classroom id
  #
  # param [String] the group id
  #
  # return [Object] classroom
  put '/classroom/:id/addgroup/:groupid' do
    if authorized?
      request.body.rewind  # in case someone already read it
      content_type :json

      classroom = Classroom.find(params[:id])

      if classroom then

        begin
          group = Group.find(params[:groupid])
        end

        if group
          classroom.groups << group
        else
          status 500
          return {"error" => "Group "+params[:groupid]+" not found"}.to_json
        end

        status 200

        return  classroom.to_json
      else
        return {"error" => "Classroom "+params[:id]+" not found"}.to_json
      end
    else
      status 401
    end
  end

  # Remove a group from a classroom by id
  #
  # param [String] the classroom id
  #
  # param [String] the group id
  #
  # return [Object] classroom
  put '/classroom/:id/removegroup/:groupid' do
    if authorized?
      request.body.rewind  # in case someone already read it
      content_type :json

      classroom = Classroom.find(params[:id])

      if classroom then

        begin
          group = Group.find(params[:groupid])
        end

        if group
          classroom.groups.delete(group)
        else
          status 500
          return {"error" => "Group "+params[:groupid]+" not found"}.to_json
        end

        status 200

        return  classroom.to_json
      else
        return {"error" => "Classroom "+params[:id]+" not found"}.to_json
      end
    else
      status 401
    end
  end

  # Add a student to a classroom by id
  #
  # param [String] the classroom id
  #
  # param [String] the student id
  #
  # return [Object] classroom
  put '/classroom/:id/addstudent/:studentid' do
    if authorized?
      request.body.rewind  # in case someone already read it
      content_type :json

      classroom = Classroom.find(params[:id])

      if classroom then

        begin
          student = Student.find(params[:studentid])
        end

        if student
          @graph = Koala::Facebook::API.new(session["access_token"])
          user = @graph.get_object(student.facebookId)
          avatar = @graph.get_picture(student.facebookId)

          student['firstName'] = user["first_name"];
          student['lastName'] = user["last_name"];
          student['avatar'] = avatar;

          classroom.students << student
        else
          status 500
          return {"error" => "Student "+params[:studentid]+" not found"}.to_json
        end

        status 200

        return  classroom.to_json
      else
        return {"error" => "Classroom "+params[:id]+" not found"}.to_json
      end
    else
      status 401
    end
  end

  # Remove a student from a classroom by id
  #
  # param [String] the classroom id
  #
  # param [String] the student id
  #
  # return [Object] classroom
  put '/classroom/:id/removestudent/:studentid' do
    if authorized?
      request.body.rewind  # in case someone already read it
      content_type :json

      classroom = Classroom.find(params[:id])

      if classroom then

        begin
          student = Student.find(params[:studentid])
        end

        if student
          classroom.students.delete(student)
        else
          status 500
          return {"error" => "Student "+params[:studentid]+" not found"}.to_json
        end

        status 200

        return  classroom.to_json
      else
        return {"error" => "Classroom "+params[:id]+" not found"}.to_json
      end
    else
      status 401
    end
  end


  # Delete a classroom by id
  #
  # param [String] the classroom id
  #
  # return [Object] message
  delete '/classroom/:id' do
    if authorized?
      request.body.rewind  # in case someone already read it
      content_type :json

      classroom = Classroom.find(params[:id])

      if classroom.groups.empty? then
        if classroom.destroy then
          status 200
          return {"message" => "Classroom "+params[:id]+" deleted"}.to_json
        else
          status 500
          return {"error" => "Classroom "+params[:id]+" not deleted"}.to_json
        end
      else
        status 401
        return {"error" => "This classroom has groups. Delete those first before deleting this classroom."}.to_json
      end
    else
      status 401
      return {"error" => "Not authorised"}.to_json
    end
  end
end
